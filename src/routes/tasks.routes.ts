import { Router } from "express";
import { 
  createTaskController,
  getTasksController,
  getTaskByIdController,
  updateTaskController,
  deleteTaskController,
  addCommentController,
  getTaskStatsController
} from "../controllers/tasks.controller";
import { authenticateToken } from "../middlewares/authenticateToken.middleware";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Task CRUD operations
router.post("/", createTaskController);
router.get("/organization/:organizationId", getTasksController);
router.get("/stats/:organizationId", getTaskStatsController);
router.get("/:taskId", getTaskByIdController);
router.put("/:taskId", updateTaskController);
router.delete("/:taskId", deleteTaskController);

// Task comments
router.post("/:taskId/comments", addCommentController);

export default router; 