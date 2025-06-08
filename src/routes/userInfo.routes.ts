import { Router } from "express";
import { getUserInfoController } from "../controllers/userInfo.controller";
import { authenticateToken } from "../middlewares/authenticateToken.middleware";

const router = Router();

router.get("/userinfo", authenticateToken, getUserInfoController);

export default router;
