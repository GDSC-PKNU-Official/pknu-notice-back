import dotenv from 'dotenv';

dotenv.config();

export default {
  PORT: process.env.PORT,
  CLIENT_PATH: process.env.CLIENT_PATH,
};
