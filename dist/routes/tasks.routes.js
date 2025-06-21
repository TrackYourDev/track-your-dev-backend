"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tasks_controller_1 = require("../controllers/tasks.controller");
const authenticateToken_middleware_1 = require("../middlewares/authenticateToken.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(authenticateToken_middleware_1.authenticateToken);
// Task CRUD operations
router.post("/", tasks_controller_1.createTaskController);
router.get("/organization/:organizationId", tasks_controller_1.getTasksController);
router.get("/stats/:organizationId", tasks_controller_1.getTaskStatsController);
router.get("/:taskId", tasks_controller_1.getTaskByIdController);
router.put("/:taskId", tasks_controller_1.updateTaskController);
router.delete("/:taskId", tasks_controller_1.deleteTaskController);
// Task comments
router.post("/:taskId/comments", tasks_controller_1.addCommentController);
exports.default = router;
