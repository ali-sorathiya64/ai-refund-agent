import { Router } from "express";
import { getAuthUrl, exchangeCodeForTokens } from "../gmailAuth.js";
import { saveTokens, getSession } from "../tokenStore.js";

const router = Router();

// Supports both browser sessions (cookie) and Postman/API testing (x-user-id header)
function resolveUserId(req) {
    return req.query.uid || req.header("x-user-id") || req.sessionID;
}

// http://localhost:3000/auth/google?uid=my-test-id  → use a fixed uid for Postman
router.get("/google", (req, res) => {
    const uid = req.query.uid || req.sessionID;
    const url = getAuthUrl(uid); // uid travels through Google's `state` param
    res.redirect(url);
});

router.get("/google/callback", async (req, res) => {
    try {
        const { code, state } = req.query;
        if (!code) return res.status(400).send("Missing authorization code");

        const uid = state || req.sessionID;
        const tokens = await exchangeCodeForTokens(code);
        saveTokens(uid, tokens);

        res.send(`
            <html>
              <body style="font-family: sans-serif; text-align:center; padding:50px;">
                <h2>✅ Gmail Connected Successfully</h2>
                <p>Use this header in Postman for every request:</p>
                <p style="font-family: monospace; background:#eee; padding:10px; display:inline-block; word-break:break-all;">
                  x-user-id: ${uid}
                </p>
              </body>
            </html>
        `);
    } catch (err) {
        console.error("OAuth callback error:", err);
        res.status(500).send("Authentication failed: " + err.message);
    }
});

router.get("/status", (req, res) => {
    const uid = resolveUserId(req);
    const session = getSession(uid);
    res.json({ connected: !!session.tokens, uid });
});

export default router;
