import { createAgent, humanInTheLoopMiddleware, tool } from "langchain";
import * as z from "zod";
import { ChatGroq } from "@langchain/groq";
import { MemorySaver } from "@langchain/langgraph";
import { google } from "googleapis";
import { config } from "./config.js";
import { getAuthorizedClient } from "./gmailAuth.js";
import { getSession } from "./tokenStore.js";

const llm = new ChatGroq({
    apiKey: config.groqApiKey,
    model: "openai/gpt-oss-120b",
    temperature: 0,
});


const checkpointer = new MemorySaver();


function buildTools(sessionId) {
    const getEmails = tool(
        async () => {
            const session = getSession(sessionId);
            if (!session.tokens) {
                throw new Error("Gmail not connected. Please login via /auth/google first.");
            }

            const auth = getAuthorizedClient(session.tokens);
            const gmail = google.gmail({ version: "v1", auth });

            const list = await gmail.users.messages.list({
                userId: "me",
                labelIds: ["INBOX"],
                maxResults: 10,
            });

            if (!list.data.messages?.length) {
                return JSON.stringify({ messages: [], resultSizeEstimate: 0 });
            }

            const messages = await Promise.all(
                list.data.messages.map(async (m) => {
                    const msg = await gmail.users.messages.get({
                        userId: "me",
                        id: m.id,
                        format: "metadata",
                        metadataHeaders: ["From", "To", "Subject", "Date"],
                    });

                    const headers = msg.data.payload.headers;
                    const getHeader = (name) =>
                        headers.find((h) => h.name === name)?.value || "";

                    return {
                        id: msg.data.id,
                        from: getHeader("From"),
                        subject: getHeader("Subject"),
                        date: getHeader("Date"),
                        snippet: msg.data.snippet,
                    };
                })
            );

            return JSON.stringify({ messages, resultSizeEstimate: messages.length });
        },
        {
            name: "get_emails",
            description: "Get the emails from inbox",
        }
    );

    const refund = tool(
        ({ emails }) => {
            // TODO: real payment gateway integration (Stripe/Razorpay refund API)
            console.log(`[session ${sessionId}] Processing refund for:`, emails);
            return "All refunds processed successfully";
        },
        {
            name: "refund",
            description: "Process the refund request from the email content",
            schema: z.object({
                emails: z
                    .array(z.string())
                    .describe("The list of the emails which need to be refunded"),
            }),
        }
    );

    return [getEmails, refund];
}

export function getAgent(sessionId) {
    return createAgent({
        model: llm,
        tools: buildTools(sessionId),
        middleware: [
            humanInTheLoopMiddleware({
                interruptOn: { refund: true },
                descriptionPrefix: "Refund pending approval",
            }),
        ],
        checkpointer,
    });
}
