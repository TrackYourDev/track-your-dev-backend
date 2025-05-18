import express from 'express';
import webhook from './routes/webhook.routes';
import waitlist from './routes/waitlist.routes';

const app = express();
app.use(express.json());

app.use('/api', webhook);
app.use('/api', waitlist);
export default app;