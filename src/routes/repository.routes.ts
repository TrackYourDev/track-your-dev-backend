import { Router } from "express";
import { toggleTasksEnabled } from "../controllers/repository.controller";

const router = Router();

router.post("/toggle-tasks", toggleTasksEnabled);

export default router; 