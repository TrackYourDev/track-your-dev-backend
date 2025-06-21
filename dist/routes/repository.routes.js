"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const repository_controller_1 = require("../controllers/repository.controller");
const router = (0, express_1.Router)();
router.post("/toggle-tasks", repository_controller_1.toggleTasksEnabled);
exports.default = router;
