import { env } from 'process';

import suggestionRouter from '@apis/suggestion/controller';
import { corsOptions } from '@middlewares/cors';
import errorHandler from '@middlewares/error-handler';
import cors from 'cors';
import express, { Request, Response } from 'express';
import morgan from 'morgan';

const app = express();
app.use(morgan('dev'));
app.use(cors(corsOptions));
app.use(express.json());
app.use(errorHandler);

app.use('/api/suggestion', suggestionRouter);

app.get('/test', (req: Request, res: Response) => {
  console.log('test');
  res.send('Hello');
});

app.listen(env.PORT, () => {
  console.log('서버 실행중');
});
