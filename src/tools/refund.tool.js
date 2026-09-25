import { tool } from "langchain";
import * as z from "zod";


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
