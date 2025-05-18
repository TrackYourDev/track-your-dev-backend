import express from 'express';
import {verifyGithubAppWebhook} from '../middlewares/verifyWebhook.middlewares.js';
import {webhookController} from '../controllers/webhook.controller.js';

const router = express.Router();

router.post('/webhook',verifyGithubAppWebhook,webhookController);


export default router;