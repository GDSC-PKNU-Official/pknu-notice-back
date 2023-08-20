import graduationRouter from '@apis/graduation/controller';
import majorRouter from '@apis/majorDecision/controller';
import noticeRouter from '@apis/notice/controller';
import subscriptionRouter from '@apis/subscribe/controller';
import suggestionRouter from '@apis/suggestion/controller';
import env from '@config';
import { saveGraduationRequirementToDB } from '@db/data/graduation';
import { corsOptions } from '@middlewares/cors';
import errorHandler from '@middlewares/error-handler';
import cors from 'cors';
import express, { Request, Response } from 'express';
import morgan from 'morgan';
import webpush from 'src/config/webpush';
import { initialCrawling } from 'src/hooks/startCrawlingData';
import './hooks/cronNoticeCrawling';

const app = express();
app.use(morgan('dev'));
app.use(cors(corsOptions));
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
app.use(express.json());
app.use(errorHandler);

initialCrawling();
saveGraduationRequirementToDB();

app.use('/api/suggestion', suggestionRouter);
app.use('/api/majorDecision', majorRouter);
app.use('/api/announcement', noticeRouter);
app.use('/api/graduation', graduationRouter);
app.use('/api/subscription', subscriptionRouter);

app.get('/test', (req: Request, res: Response) => {
  console.log('tet');
  res.send('Hello');
});

app.listen(env.SERVER_PORT, () => {
  console.log(env.SERVER_PORT, '포트 서버 실행중');
});

webpush();
