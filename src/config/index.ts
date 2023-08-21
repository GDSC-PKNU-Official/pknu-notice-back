import dotenv from 'dotenv';

dotenv.config();

export default {
  SERVER_PORT: process.env.SERVER_PORT,
  CLIENT_PATH: process.env.CLIENT_PATH,
  DB_HOST: process.env.DATABASE_HOST,
  DB_USER: process.env.DATABASE_USER,
  DB_PW: process.env.DATABASE_USER_PASSWORD,
  DB_NAME: process.env.DATABASE_NAME,
  DB_PORT: process.env.DATABASE_PORT,
  NOTION_API_KEY: process.env.NOTION_API_KEY,
  NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
  ROOT_EMAIL: process.env.ROOT_EMAIL,
};
