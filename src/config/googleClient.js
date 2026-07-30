import { google } from "googleapis";
import fs from "fs";

const CREDENTIALS_PATH = "./credentials.json";

export const SCOPES = ["https://www.googleapis.com/auth/gmail.modify"];

/**
 * Builds a fresh OAuth2 client from credentials.json.
 * IMPORTANT: for Express, your Google Cloud OAuth client must be of type
 * "Web application" with redirect URI set to:
 *   http://localhost:3000/auth/google/callback
 */
export function getOAuthClient() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
  const creds = credentials.web || credentials.installed;
  const { client_id, client_secret, redirect_uris } = creds;

  const redirectUri = process.env.GOOGLE_REDIRECT_URI || redirect_uris[0];

  return new google.auth.OAuth2(client_id, client_secret, redirectUri);
}
