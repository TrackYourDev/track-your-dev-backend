import { Request,Response } from "express";

export const webhookController = (req: Request, res: Response) => {
  const event = req.headers['x-github-event'];
  const installationId = req.headers['x-github-hook-installation-target-id'];
  const deliveryId = req.headers['x-github-delivery'];
  const payload = req.body;

  console.log('GitHub App Webhook Details:');
  console.log('Event:', event);
  console.log('Installation ID:', installationId);
  console.log('Delivery ID:', deliveryId);
  console.log('Event payload:', JSON.stringify(payload, null, 2));

  res.status(200).json({ message: 'GitHub App webhook received successfully' });
}