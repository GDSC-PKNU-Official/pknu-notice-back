import { saveNoticeToDB } from '@db/data/handler';
import cron from 'node-cron';

cron.schedule('0 2 * * *', () => {
  saveNoticeToDB();
});
