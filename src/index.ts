import majorRouter from '@apis/majorDecision/controller';
import noticeRouter from '@apis/notice/controller';
import suggestionRouter from '@apis/suggestion/controller';
import env from '@config';
import { corsOptions } from '@middlewares/cors';
import errorHandler from '@middlewares/error-handler';
import cors from 'cors';
import express, { Request, Response } from 'express';
import morgan from 'morgan';

const app = express();
app.use(morgan('dev'));
app.use(cors(corsOptions));
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
app.use(express.json());
app.use(errorHandler);

app.use('/api/suggestion', suggestionRouter);
app.use('/api/majorDecision', majorRouter);
app.use('/api/announcement', noticeRouter);

app.get('/test', (req: Request, res: Response) => {
  console.log('test');
  res.send('Hello');
});

app.listen(env.SERVER_PORT, () => {
  console.log('서버 실행중');
});
