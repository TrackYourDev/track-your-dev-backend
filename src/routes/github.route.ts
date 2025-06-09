import express from "express";
import { previewAllData } from "../controllers/preview.controller";

const router = express.Router();

router.get("/github/preview", previewAllData);

export default router;
