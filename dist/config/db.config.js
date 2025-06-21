"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_config_1 = require("./dotenv.config");
let isConnected = false;
const connectDB = async () => {
    if (isConnected) {
        console.log("✅ Using existing MongoDB connection.");
        return;
    }
    try {
        mongoose_1.default.set("strictQuery", true);
        const db = await mongoose_1.default.connect(dotenv_config_1.MONGODB_URI, {
            dbName: dotenv_config_1.MONGODB_DBNAME,
        });
        isConnected = db.connections[0].readyState === 1;
        console.log("🚀 Connected to MongoDB!");
    }
    catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
    mongoose_1.default.connection.on("disconnected", () => {
        console.warn("⚠️ MongoDB Disconnected! Attempting to reconnect...");
        (0, exports.connectDB)();
    });
    mongoose_1.default.connection.on("reconnected", () => {
        console.log("😅 MongoDB reconnected!");
    });
};
exports.connectDB = connectDB;
