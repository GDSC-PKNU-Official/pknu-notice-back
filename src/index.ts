import { env } from 'process';

import { corsOptions } from '@middlewares/cors';
import errorHandler from '@middlewares/error-handler';
import cors from 'cors';
import express, { Request, Response } from 'express';
import morgan from 'morgan';

const app = express();
app.use(morgan('dev'));
app.use(cors(corsOptions));

app.get('/test', (req: Request, res: Response) => {
  res.send('Hello');
});

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log('서버 실행중');
});
