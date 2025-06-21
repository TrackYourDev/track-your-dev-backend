"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyGithubAppWebhook = void 0;
const crypto_1 = __importDefault(require("crypto"));
const dotenv_config_1 = require("../config/dotenv.config");
const responseHendler_1 = require("../utils/responseHendler");
const verifyGithubAppWebhook = (req, res, next) => {
    try {
        const { 'x-hub-signature-256': signature, 'x-github-hook-installation-target-id': installationId, 'x-github-delivery': deliveryId, 'x-github-event': event } = req.headers;
        if (!signature)
            return (0, responseHendler_1.errorResponse)(res, "Missing X-Hub-Signature-256", 401);
        if (!installationId)
            return (0, responseHendler_1.errorResponse)(res, "Missing Installation ID", 401);
        if (!deliveryId)
            return (0, responseHendler_1.errorResponse)(res, "Missing Delivery ID", 401);
        if (!event)
            return (0, responseHendler_1.errorResponse)(res, "Missing Event Type", 401);
        const payload = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
        if (!payload) {
            return (0, responseHendler_1.errorResponse)(res, "Empty payload", 400);
        }
        const hmac = crypto_1.default.createHmac("sha256", dotenv_config_1.WEBHOOK_SECRET);
        const digest = `sha256=${hmac.update(payload).digest("hex")}`;
        if (!crypto_1.default.timingSafeEqual(Buffer.from(signature || "", "utf8"), Buffer.from(digest, "utf8"))) {
            return (0, responseHendler_1.errorResponse)(res, "Invalid signature", 401);
        }
        next();
    }
    catch (error) {
        console.error("Webhook verification error:", {
            error: error instanceof Error ? error.stack : error,
            headers: req.headers,
            body: req.body
        });
        return (0, responseHendler_1.errorResponse)(res, "Webhook verification failed", 500, error);
    }
};
exports.verifyGithubAppWebhook = verifyGithubAppWebhook;
