import { Router } from "express";
import { getUserInfoController } from "../controllers/userInfo.controller";
import { getCommitsController } from "../controllers/commits.controller";
import { authenticateToken } from "../middlewares/authenticateToken.middleware";

const router = Router();

router.get("/userinfo", authenticateToken, getUserInfoController);
router.get("/commits/:orgName/:repoName", authenticateToken, getCommitsController);

export default router;
