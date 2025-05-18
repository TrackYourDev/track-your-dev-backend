import mongoose from "mongoose";
import { MONGODB_URI,MONGODB_DBNAME } from "./dotenv.config.js";

let isConnected = false;
export const connectDB = async () => {
    if (isConnected) {
        console.log("✅ Using existing MongoDB connection.");
        return;
    }
    try {
        mongoose.set("strictQuery", true);
        const db = await mongoose.connect(MONGODB_URI, {
            dbName: MONGODB_DBNAME,
        });
        isConnected = db.connections[0].readyState === 1;
        console.log("🚀 Connected to MongoDB!");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }

    mongoose.connection.on("disconnected", () => {
        console.warn("⚠️ MongoDB Disconnected! Attempting to reconnect...");
        connectDB();
    });
    mongoose.connection.on("reconnected", () => {
        console.log("�� MongoDB reconnected!");
    });
}

