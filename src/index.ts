import { env } from 'process';

import { collegeCrawling } from '@crawling/collegeCrawling';
import { corsOptions } from '@middlewares/cors';
import errorHandler from '@middlewares/error-handler';
import cors from 'cors';
import express, { Request, Response } from 'express';
import morgan from 'morgan';

const app = express();
app.use(morgan('dev'));
app.use(cors(corsOptions));
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

app.get('/test', (req: Request, res: Response) => {
  res.send('Hello');
});

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log('서버 실행중');
});

// const start = async () => {
//   const val = await collegeCrawling();
//   console.log(val);
// };

// start();

// // const val3 = graduationRequirementsCrawling('http://safe.pknu.ac.kr');
// // console.log(val3);
