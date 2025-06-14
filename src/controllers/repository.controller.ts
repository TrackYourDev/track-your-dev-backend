import { Request, Response } from "express";
import { Repository } from "../models/repositories.model";
import { successResponse, errorResponse } from "../utils/responseHendler";

export async function toggleTasksEnabled(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { repoId, enabled } = req.body;

    if (!repoId || typeof enabled !== 'boolean') {
      return errorResponse(
        res,
        "Invalid request body. Required fields: repoId (string) and enabled (boolean)",
        400
      );
    }

    const updatedRepo = await Repository.findOneAndUpdate(
      { repoId },
      { enabledForTasks: enabled },
      { new: true }
    );

    if (!updatedRepo) {
      return errorResponse(
        res,
        "Repository not found",
        404
      );
    }

    return successResponse(
      res,
      `Tasks ${enabled ? 'enabled' : 'disabled'} for repository successfully`,
      { repository: updatedRepo },
      200
    );
  } catch (error) {
    console.error("Error toggling tasks enabled status:", error);
    return errorResponse(res, "Failed to update repository", 500, error);
  }
} 