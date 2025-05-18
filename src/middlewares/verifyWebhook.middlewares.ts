import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const verifyGithubAppWebhook = (req: Request, res: Response, next: NextFunction): void => {
  const signature = req.headers['x-hub-signature-256'];
  const installationId = req.headers['x-github-hook-installation-target-id'];
  const deliveryId = req.headers['x-github-delivery'];
  const event = req.headers['x-github-event'];
  const payload = JSON.stringify(req.body);
  
  if (!signature || !installationId || !deliveryId || !event) {
    res.status(401).json({ error: 'Missing required GitHub App headers' });
    return;
  }

  const hmac = crypto.createHmac('sha256', "akkadbakkadbambebo");
  const digest = `sha256=${hmac.update(payload).digest('hex')}`;

  if (signature !== digest) {
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  next();
};