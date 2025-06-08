import { Router } from "express";
import { getUserCommits } from "../controllers/userInfo.controller";
import { authenticateToken } from "../middlewares/userInfo.middleware";

const router = Router();

router.get("/user/commits", authenticateToken, getUserCommits);

export default router;
