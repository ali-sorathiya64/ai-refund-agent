import { tool } from "langchain";
import * as z from "zod";

/**
 * This tool is intentionally simple/simulated for now.
 * In a real system, this is where you'd call your payment gateway
 * (Stripe/Razorpay refunds.create) and then send a confirmation email
 * back via the Gmail API.
 *
 * It's the ONE tool wrapped in human-in-the-loop approval — see
 * agent.service.js — because it's an irreversible financial action.
 */
export function createRefundTool() {
  return tool(
    ({ emails }) => {
      console.log("Processing refund for:", emails);
      // TODO: integrate real payment gateway refund API here
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
}
