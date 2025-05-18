import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { WEBHOOK_SECRET } from "../config/dotenv.config";
import { GitHubWebhookHeaders } from "../types/index.types";
import { Responses } from "../utils/responseHendler";
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
       res
        .status(401)
        .json(Responses.unauthorized("Missing X-Hub-Signature-256"));
    if (!installationId)
       res
        .status(401)
        .json(Responses.unauthorized("Missing Installation ID"));
    if (!deliveryId)
       res
        .status(401)
        .json(Responses.unauthorized("Missing Delivery ID"));
    if (!event)
       res.status(401).json(Responses.unauthorized("Missing Event Type"));

    const payload =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body);

       if (!payload) {
       res.status(400).json(Responses.badRequest("Empty payload"));
    }
     const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
    const digest = `sha256=${hmac.update(payload).digest("hex")}`;

    if (!crypto.timingSafeEqual(
      Buffer.from(signature || "", "utf8"), 
      Buffer.from(digest, "utf8"))
    ) {
       res.status(401).json(Responses.unauthorized("Invalid signature"));
    }
    next();
  }  catch (error) {
    console.error("Webhook verification error:", {
      error: error instanceof Error ? error.stack : error,
      headers: req.headers,
      body: req.body
    });
    res.status(500).json(
      Responses.serverError("Webhook verification failed", error)
    );
  }
};
