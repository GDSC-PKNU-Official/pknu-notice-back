import { env } from 'process';

export const corsOptions = {
  origin: env.CLIENT_PATH,
  method: ['GET', 'POST'],
  allowedHeaders: ['content-Type', 'Authorization'],
};
