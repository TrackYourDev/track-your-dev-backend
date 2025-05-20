import express from 'express';
import {verifyGithubAppWebhook} from '../middlewares/verifyWebhook.middlewares';
import {handleGitHubWebhook} from '../controllers/webhook.controller';

const router = express.Router();

router.post('/webhook',verifyGithubAppWebhook,handleGitHubWebhook);


export default router;