import { google } from "googleapis";
import { getOAuthClient } from "../config/googleClient.js";
import { getTokens } from "../store/tokenStore.js";

/**
 * Returns a Gmail API client authenticated as the user tied to this session.
 * Throws if the session hasn't completed OAuth yet.
 */
export function getGmailClient(sessionId) {
  const tokens = getTokens(sessionId);
  if (!tokens) {
    throw new Error("Not authenticated with Gmail. Visit /auth/google first.");
  }

  const oAuth2Client = getOAuthClient();
  oAuth2Client.setCredentials(tokens);

  return google.gmail({ version: "v1", auth: oAuth2Client });
}
