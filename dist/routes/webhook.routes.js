"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyWebhook_middlewares_1 = require("../middlewares/verifyWebhook.middlewares");
const webhook_controller_1 = require("../controllers/webhook.controller");
const router = express_1.default.Router();
router.post('/webhook', verifyWebhook_middlewares_1.verifyGithubAppWebhook, webhook_controller_1.handleGitHubWebhook);
exports.default = router;
