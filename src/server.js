import express from "express";
import session from "express-session";
import { config } from "./config.js";
import authRoutes from "./routes/auth.routes.js";
import chatRoutes from "./routes/chat.routes.js";

const app = express();

app.use(express.json());

// Session cookie se hi hum user ko identify karte hain (login/signup system
// abhi nahi hai — real product me isko proper user auth se replace karo)
app.use(
    session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 din
    })
);

app.use("/auth", authRoutes);
app.use("/api", chatRoutes);

app.get("/", (req, res) => {
    res.send(`
        <html>
          <body style="font-family: sans-serif; max-width:600px; margin:50px auto;">
            <h2>🤖 AI Refund Agent — Backend Running</h2>
            <p><a href="/auth/google">1. Connect Gmail</a></p>
            <p>2. Check connection: <code>GET /auth/status</code></p>
            <p>3. Chat: <code>POST /api/chat</code> with <code>{ "message": "..." }</code></p>
            <p>4. Approve/Reject refund: <code>POST /api/resume</code> with <code>{ "decision": "approve" }</code></p>
          </body>
        </html>
    `);
});

app.listen(config.port, () => {
    console.log(`🚀 Server running at http://localhost:${config.port}`);
});
