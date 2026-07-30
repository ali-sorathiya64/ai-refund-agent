import { google } from "googleapis";
import fs from "fs";
import { config } from "./config.js";

const SCOPES = ["https://www.googleapis.com/auth/gmail.modify"];

function getOAuthClient() {
    const credentials = JSON.parse(fs.readFileSync(config.googleCredentialsPath, "utf-8"));
    const creds = credentials.web || credentials.installed;
    const { client_id, client_secret, redirect_uris } = creds;
    return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}

// Google login URL banata hai. `state` me hum sessionId bhejte hain
// taaki callback pe pata chale ye login kis session ke liye tha.
export function getAuthUrl(state) {
    const client = getOAuthClient();
    return client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
        prompt: "consent",
        state,
    });
}

export async function exchangeCodeForTokens(code) {
    const client = getOAuthClient();
    const { tokens } = await client.getToken(code);
    return tokens;
}

export function getAuthorizedClient(tokens) {
    const client = getOAuthClient();
    client.setCredentials(tokens);
    return client;
}
