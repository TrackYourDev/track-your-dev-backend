import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import webhook from './routes/webhook.routes';
import waitlist from './routes/waitlist.routes';
import UserInfo  from './routes/userInfo.routes';
import oldCommit from './routes/github.route'
import dates from './routes/dates.routes';

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api', webhook);
app.use('/api', waitlist);
app.use('/api', UserInfo);
app.use('/api',oldCommit);
app.use('/api', dates);

export default app;