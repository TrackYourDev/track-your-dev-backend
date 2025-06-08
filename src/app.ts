import express from 'express';
import cors from 'cors';
import webhook from './routes/webhook.routes';
import waitlist from './routes/waitlist.routes';
import UserInfo  from './routes/userInfo.routes';
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', webhook);
app.use('/api', waitlist);
app.use('/api', UserInfo )
export default app;