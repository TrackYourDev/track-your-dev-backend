import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { supabase } from './config/supabase';

const app = express();
const port = process.env.PORT || 3000;

// GitHub App webhook secret - should be set in environment variables
const GITHUB_APP_WEBHOOK_SECRET = process.env.GITHUB_APP_WEBHOOK_SECRET || 'your-app-webhook-secret';

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to verify GitHub App webhook signature
const verifyGithubAppWebhook = (req: Request, res: Response, next: NextFunction): void => {
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

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

// Test database connection endpoint
app.get('/test-db', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('_test').select('*').limit(1);
    
    if (error) {
      throw error;
    }
    
    res.json({ 
      message: 'Database connection successful',
      data 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      error: 'Failed to connect to database',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GitHub App webhook endpoint
app.post('/webhook', verifyGithubAppWebhook, (req: Request, res: Response) => {
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
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});