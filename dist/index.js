"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_config_1 = require("./config/db.config");
const dotenv_config_1 = require("./config/dotenv.config");
const scheduler_1 = require("./scheduler");
(0, db_config_1.connectDB)().then(() => {
    app_1.default.listen(dotenv_config_1.PORT, () => {
        console.log(`🚀 Server is running on port ${dotenv_config_1.PORT}`);
        (0, scheduler_1.startScheduler)();
    });
}).catch((error) => {
    console.error("❌ Server startup failed:", error);
});
