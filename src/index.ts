import express, { Request, Response } from 'express';

const app = express();

export const sum = (a: number, b: number): number => {
  return a + b;
};

app.get('/test', (req: Request, res: Response) => {
  res.send('Hello');
});

app.listen('8080', () => {
  console.log('서버 실행중');
});
