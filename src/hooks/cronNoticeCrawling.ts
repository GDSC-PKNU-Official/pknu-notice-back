import { pushNotification } from '@apis/subscribe/service';
import {
  PushNoti,
  saveNoticeToDB,
  saveSchoolNoticeToDB,
  saveWhalebeToDB,
} from '@db/data/handler';
import cron from 'node-cron';
import notificationToSlack from 'src/hooks/notificateToSlack';

const pushToUsers = async (pushNotiToUserLists: PushNoti) => {
  let pushedUserCount = ``;
  for (const key in pushNotiToUserLists) {
    const count = await pushNotification(key, pushNotiToUserLists[key]);
    pushedUserCount += `${key} ${count}명 알림 완료\n`;
  }
  notificationToSlack(pushedUserCount);
};

cron.schedule('0 0-9 * * 1-5', async () => {
  const pushNotiToUserLists = await saveNoticeToDB();
  await saveSchoolNoticeToDB();
  await saveWhalebeToDB();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // 월은 0부터 시작하므로 1을 더해줍니다.
  const day = today.getDate();
  notificationToSlack(`${year}-${month}-${day} 크롤링 완료`);
  console.log(`${year}-${month}-${day} 크롤링 완료`);
  pushToUsers(pushNotiToUserLists);
});
