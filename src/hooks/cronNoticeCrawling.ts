import { saveNoticeToDB, saveSchoolNoticeToDB } from '@db/data/handler';
import cron from 'node-cron';
import notificationToSlack from 'src/hooks/notificateToSlack';

cron.schedule('0 2 * * *', async () => {
  await saveNoticeToDB();
  await saveSchoolNoticeToDB();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // 월은 0부터 시작하므로 1을 더해줍니다.
  const day = today.getDate();
  notificationToSlack(`${year}-${month}-${day} 크롤링 완료`);
});
