import { sendMessage } from "../services/agent.service.js";

// POST /api/chat
// Body: { "message": "check my inbox for refunds", "threadId": "user-123" }
export async function chat(req, res) {
  try {
    if (!req.session.authenticated) {
      return res
        .status(401)
        .json({ error: "Not authenticated. Visit /auth/google first." });
    }

    const { message, threadId } = req.body;

    if (!message || !threadId) {
      return res
        .status(400)
        .json({ error: "Both 'message' and 'threadId' are required" });
    }

    const result = await sendMessage({
      sessionId: req.session.id,
      threadId,
      message,
    });

    res.json(result);
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: err.message });
  }
}
