import { createAgent, humanInTheLoopMiddleware } from "langchain";
import { ChatGroq } from "@langchain/groq";
import { MemorySaver, Command } from "@langchain/langgraph";

import { createGetEmailsTool } from "../tools/getEmails.tool.js";
import { createRefundTool } from "../tools/refund.tool.js";

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0,
});

// One agent instance per browser session (so each user's tools/state
// stay isolated). In-memory — swap for a real cache/DB in production.
const agents = new Map(); // sessionId -> agent
const pendingInterrupts = new Map(); // threadId -> interrupt object

function getOrCreateAgent(sessionId) {
  if (agents.has(sessionId)) return agents.get(sessionId);

  const agent = createAgent({
    model: llm,
    tools: [createGetEmailsTool(sessionId), createRefundTool()],
    middleware: [
      humanInTheLoopMiddleware({
        interruptOn: { refund: true },
        descriptionPrefix: "Refund pending approval",
      }),
    ],
    checkpointer: new MemorySaver(),
  });

  agents.set(sessionId, agent);
  return agent;
}

/**
 * Sends a user message to the agent for a given conversation thread.
 * Handles both normal turns and resuming after a human-in-the-loop
 * interrupt (e.g. approving/rejecting a refund).
 */
export async function sendMessage({ sessionId, threadId, message }) {
  const agent = getOrCreateAgent(sessionId);
  const pending = pendingInterrupts.get(threadId);

  const input = pending
    ? new Command({
        resume: {
          [pending.id]: {
            decisions: [
              {
                type: /^(1|approve|yes)$/i.test(message.trim())
                  ? "approve"
                  : "reject",
              },
            ],
          },
        },
      })
    : { messages: [{ role: "user", content: message }] };

  const response = await agent.invoke(input, {
    configurable: { thread_id: threadId },
  });

  pendingInterrupts.delete(threadId);

  if (response?.__interrupt__?.length) {
    const interrupt = response.__interrupt__[0];
    pendingInterrupts.set(threadId, interrupt);

    return {
      interrupted: true,
      description: interrupt.value.actionRequests[0].description,
      options: interrupt.value.reviewConfigs[0].allowedDecisions.filter(
        (d) => d !== "edit"
      ),
    };
  }

  return {
    interrupted: false,
    reply: response.messages[response.messages.length - 1].content,
  };
}
