import { config as dotenvConfig } from "dotenv";

dotenvConfig();

export const PORT = process.env.PORT || "3000";
export const MONGODB_URI = process.env.MONGODB_URI || "";
export const MONGODB_DBNAME = process.env.MONGODB_DBNAME || "";