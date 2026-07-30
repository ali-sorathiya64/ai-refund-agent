import { getOAuthClient, SCOPES } from "../config/googleClient.js";
import { saveTokens } from "../store/tokenStore.js";


export function googleLogin(req, res) {
  const oAuth2Client = getOAuthClient();

  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline", // needed to get a refresh_token
    scope: SCOPES,
    prompt: "consent",
  });

  res.redirect(url);
}

export async function googleCallback(req, res) {
  const { code, error } = req.query;

  if (error) {
    return res.status(400).send(`Google returned an error: ${error}`);
  }
  if (!code) {
    return res.status(400).send("Missing authorization code");
  }

  try {
    const oAuth2Client = getOAuthClient();
    const { tokens } = await oAuth2Client.getToken(code);

    // Store tokens against this browser's session
    saveTokens(req.session.id, tokens);
    req.session.authenticated = true;

    res.send(
      "✅ Gmail connected successfully! You can close this tab and go back to the app."
    );
  } catch (err) {
    console.error("OAuth callback error:", err.message);
    res.status(500).send("OAuth exchange failed: " + err.message);
  }
}

// GET /auth/status
// Lets the frontend check if the current session is authenticated.
export function authStatus(req, res) {
  res.json({ authenticated: !!req.session.authenticated });
}
