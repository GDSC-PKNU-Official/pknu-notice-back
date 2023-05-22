import dotenv from 'dotenv';

dotenv.config();

export default {
  PORT: process.env.PORT,
  CLIENT_PATH: process.env.CLIENT_PATH,
  NOTION_API_KEY: process.env.NOTION_API_KEY,
  NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
};
