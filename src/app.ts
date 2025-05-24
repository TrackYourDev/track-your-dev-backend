import express from 'express';
import cors from 'cors';
import webhook from './routes/webhook.routes';
import waitlist from './routes/waitlist.routes';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', webhook);
app.use('/api', waitlist);
export default app;