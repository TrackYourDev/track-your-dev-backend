"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dates_controller_1 = require("../controllers/dates.controller");
const authenticateToken_middleware_1 = require("../middlewares/authenticateToken.middleware");
const router = (0, express_1.Router)();
// Get dates that need processing for an organization
router.get("/:orgName/dates", authenticateToken_middleware_1.authenticateToken, dates_controller_1.getDatesToProcess);
exports.default = router;
