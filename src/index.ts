import buildingInfoRouter from '@apis/building-info/controllers';
import graduationRouter from '@apis/graduation/controller';
import majorRouter from '@apis/majorDecision/controller';
import noticeRouter from '@apis/notice/controller';
import subscriptionRouter from '@apis/subscribe/controller';
import suggestionRouter from '@apis/suggestion/controller';
import env from '@config';
import { corsOptions } from '@middlewares/cors';
import errorHandler from '@middlewares/error-handler';
import cors from 'cors';
import express, { Request, Response } from 'express';
import morgan from 'morgan';
import webpush from 'src/config/webpush';
import { initialCrawling } from 'src/hooks/startCrawlingData';
import './hooks/cronNoticeCrawling';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(errorHandler);

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

initialCrawling();

app.use('/api/suggestion', suggestionRouter);
app.use('/api/majorDecision', majorRouter);
app.use('/api/announcement', noticeRouter);
app.use('/api/graduation', graduationRouter);
app.use('/api/subscription', subscriptionRouter);
app.use('/api/buildingInfo', buildingInfoRouter);

app.get('/test', (req: Request, res: Response) => {
  console.log('test');
  res.send('Hello');
});

app.listen(env.SERVER_PORT, () => {
  console.log(env.SERVER_PORT, '포트 서버 실행중');
});

webpush();

const handleDeployToServer = async () => {
  // 이 함수는 현재 배포되어있는 서버를 위해 사용되는 로직이며 최초 서버에 배포되는 1회만 실행되도록 하기위한 함수에요
  // 그렇기에 아래에 작성된 코드들은 배포서버에 배포되면 다음 배포전 수정해주세요!!
  // 전공 관련 크롤링
};

// handleDeployToServer();
