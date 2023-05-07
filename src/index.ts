import { env } from 'process';

import express, { Request, Response } from 'express';
import morgan from 'morgan';

const app = express();
app.use(morgan('dev'));

app.get('/test', (req: Request, res: Response) => {
  res.send('Hello');
});

app.listen(env.PORT, () => {
  console.log('서버 실행중');
});
