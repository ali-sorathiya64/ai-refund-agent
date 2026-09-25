import { tool } from "langchain";
import { getGmailClient } from "../services/gmail.service.js";


export function createGetEmailsTool(sessionId) {
  return tool(
    async () => {
      const gmail = getGmailClient(sessionId);

      const list = await gmail.users.messages.list({
        userId: "me",
        labelIds: ["INBOX"],
        maxResults: 10,
      });

      if (!list.data.messages || list.data.messages.length === 0) {
        return JSON.stringify({ messages: [], resultSizeEstimate: 0 });
      }

      // Use "metadata" format (not "full") to avoid blowing up the LLM's
      // context window with raw MIME bodies/attachments.
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
            threadId: msg.data.threadId,
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
}
