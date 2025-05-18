import { config as dotenvConfig } from "dotenv";

dotenvConfig();

export const PORT = process.env.PORT || "3000";
export const MONGODB_URI = process.env.MONGODB_URI || "";
export const MONGODB_DBNAME = process.env.MONGODB_DBNAME || "";
export const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET  || "";
export const MAIL_USER = process.env.MAIL_USER || "";
export const MAIL_PASS = process.env.MAIL_PASS || "";
export const MAIL_HOST = process.env.MAIL_HOST || "";
export const MAIL_PORT = process.env.MAIL_PORT || "";