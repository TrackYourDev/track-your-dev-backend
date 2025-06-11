import { Router } from "express";
import { syncAndGetData } from "../controllers/preview.controller";
import { authenticateToken } from "../middlewares/authenticateToken.middleware";

const router = Router();

router.get("/preview", authenticateToken, syncAndGetData);

export default router;
