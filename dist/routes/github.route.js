"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const preview_controller_1 = require("../controllers/preview.controller");
const authenticateToken_middleware_1 = require("../middlewares/authenticateToken.middleware");
const router = (0, express_1.Router)();
router.get("/preview", authenticateToken_middleware_1.authenticateToken, preview_controller_1.syncAndGetData);
exports.default = router;
