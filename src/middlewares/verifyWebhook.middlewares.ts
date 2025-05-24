import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { WEBHOOK_SECRET } from "../config/dotenv.config";
import { GitHubWebhookHeaders } from "../types/index.types";
import { errorResponse } from "../utils/responseHendler";
export const verifyGithubAppWebhook = (
  req: Request,
  res: Response,
  next: NextFunction
):void => {
  try {
     const {
      'x-hub-signature-256': signature,
      'x-github-hook-installation-target-id': installationId,
      'x-github-delivery': deliveryId,
      'x-github-event': event
    } = req.headers as GitHubWebhookHeaders;
    if (!signature)
       return errorResponse(res, "Missing X-Hub-Signature-256", 401);
    if (!installationId)
       return errorResponse(res, "Missing Installation ID", 401);
    if (!deliveryId)
       return errorResponse(res, "Missing Delivery ID", 401);
    if (!event)
       return errorResponse(res, "Missing Event Type", 401);

    const payload =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body);

       if (!payload) {
       return errorResponse(res, "Empty payload", 400);
    }
     const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
    const digest = `sha256=${hmac.update(payload).digest("hex")}`;

    if (!crypto.timingSafeEqual(
      Buffer.from(signature || "", "utf8"), 
      Buffer.from(digest, "utf8"))
    ) {
       return errorResponse(res, "Invalid signature", 401);
    }
    next();
  }  catch (error) {
    console.error("Webhook verification error:", {
      error: error instanceof Error ? error.stack : error,
      headers: req.headers,
      body: req.body
    });
    return errorResponse(res, "Webhook verification failed", 500, error);
  }
};
