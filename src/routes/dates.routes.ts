import { Router } from "express";
import { getDatesToProcess } from "../controllers/dates.controller";
import { authenticateToken } from "../middlewares/authenticateToken.middleware";

const router = Router();

// Get dates that need processing for an organization
router.get(
  "/:orgName/dates",
  authenticateToken,
  getDatesToProcess
);

export default router; 