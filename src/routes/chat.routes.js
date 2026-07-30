import { Router } from "express";
import { Command } from "@langchain/langgraph";
import { getAgent } from "../agent.js";
import { getSession, savePendingInterrupt, clearPendingInterrupt } from "../tokenStore.js";

const router = Router();

function resolveUserId(req) {
    return req.header("x-user-id") || req.sessionID;
}

function formatResponse(response, userId) {
    if (response?.__interrupt__?.length) {
        const interrupt = response.__interrupt__[0];
        savePendingInterrupt(userId, interrupt);

        const actionRequest = interrupt.value.actionRequests[0];
        const allowedDecisions = interrupt.value.reviewConfigs[0].allowedDecisions.filter(
            (d) => d !== "edit"
        );

        return {
            type: "approval_required",
            description: actionRequest.description,
            options: allowedDecisions,
        };
    }

    clearPendingInterrupt(userId);
    const lastMessage = response.messages[response.messages.length - 1];
    return { type: "message", content: lastMessage.content };
}

router.post("/chat", async (req, res) => {
    try {
        const userId = resolveUserId(req);
        const session = getSession(userId);
        const { message } = req.body;

        if (!message) return res.status(400).json({ error: "message is required" });
        if (!session.tokens) {
            return res
                .status(401)
                .json({ error: "Gmail not connected. Visit /auth/google first." });
        }

        const agent = getAgent(userId);
        const response = await agent.invoke(
            { messages: [{ role: "user", content: message }] },
            { configurable: { thread_id: session.threadId } }
        );

        res.json(formatResponse(response, userId));
    } catch (err) {
        console.error("Chat error:", err);
        res.status(500).json({ error: err.message });
    }
});

router.post("/resume", async (req, res) => {
    try {
        const userId = resolveUserId(req);
        const session = getSession(userId);
        const { decision } = req.body;

        if (!session.pendingInterrupt) {
            return res.status(400).json({ error: "No pending approval for this session." });
        }
        if (!["approve", "reject"].includes(decision)) {
            return res.status(400).json({ error: "decision must be 'approve' or 'reject'" });
        }

        const agent = getAgent(userId);
        const interruptId = session.pendingInterrupt.id;

        const response = await agent.invoke(
            new Command({
                resume: { [interruptId]: { decisions: [{ type: decision }] } },
            }),
            { configurable: { thread_id: session.threadId } }
        );

        res.json(formatResponse(response, userId));
    } catch (err) {
        console.error("Resume error:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
