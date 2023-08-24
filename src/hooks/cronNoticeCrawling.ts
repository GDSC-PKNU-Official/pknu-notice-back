import { pushNotification } from '@apis/subscribe/service';
import { saveNoticeToDB } from '@db/data/handler';
import cron from 'node-cron';
import notificationToSlack from 'src/hooks/notificateToSlack';

const pushToUsers = async (majors: string[]) => {
  return new Promise<void>((resolve) => {
    for (const major of majors) {
      pushNotification(major);
    }
  });
};

cron.schedule('0 10 * * *', async () => {
  const majors = await saveNoticeToDB();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // 월은 0부터 시작하므로 1을 더해줍니다.
  const day = today.getDate();
  notificationToSlack(`${year}-${month}-${day} 크롤링 완료`);
  console.log(`${year}-${month}-${day} 크롤링 완료`);
  pushToUsers(majors);
});
