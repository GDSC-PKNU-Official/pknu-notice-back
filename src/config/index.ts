import dotenv from 'dotenv';

dotenv.config();

export default {
  SERVER_PORT: process.env.SERVER_PORT,
  CLIENT_PATH: process.env.CLIENT_PATH,
  DB_USER: process.env.DATABASE_USER,
  DB_PW: process.env.DATABASE_USER_PASSWORD,
  DB_NAME: process.env.DATABASE_NAME,
  DB_PORT: process.env.DATABASE_PORT,
  NOTION_API_KEY: process.env.NOTION_API_KEY,
  NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
};
