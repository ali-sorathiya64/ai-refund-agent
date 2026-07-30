import dotenv from "dotenv";
dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    groqApiKey: process.env.GROQ_API_KEY,
    sessionSecret: process.env.SESSION_SECRET || "dev-secret-change-me",
    googleCredentialsPath: process.env.GOOGLE_CREDENTIALS_PATH || "./credentials.json",
};
