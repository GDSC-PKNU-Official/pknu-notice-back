import { pushNotification } from '@apis/subscribe/service';
import { saveLanguageNoticeToDB } from '@db/data/languageHandler';
import {
  PushNoti,
  saveMajorNoticeToDB,
  saveSchoolNoticeToDB,
  saveWhalebeToDB,
} from '@db/data/noticeHandler';
import { recruitHandler } from '@db/data/recruitHandler';
import db from '@db/index';
import cron from 'node-cron';
import notificationToSlack from 'src/hooks/notificateToSlack';

const pushToUsers = async (pushNotiToUserLists: PushNoti) => {
  let pushedUserCount = ``;
  for (const key in pushNotiToUserLists) {
    const count = await pushNotification(key, pushNotiToUserLists[key]);
    if (!count) continue;
    pushedUserCount += `학과번호:${key}, ${count}명 알림 완료\n`;
  }
  if (pushedUserCount.length !== 0) notificationToSlack(pushedUserCount);
};

const cronNoticeCrawling = async () => {
  const connection = await db.getConnection();
  await connection.beginTransaction();
  try {
    const pushNotiToUserLists = await saveMajorNoticeToDB(connection);
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // 월은 0부터 시작하므로 1을 더해줍니다.
    const day = today.getDate();
    notificationToSlack(`${year}-${month}-${day} 크롤링 완료`);
    await connection.commit();
    pushToUsers(pushNotiToUserLists);
  } catch (error) {
    await connection.rollback();
    notificationToSlack(error.message);
    cronNoticeCrawling();
  } finally {
    connection.release();
  }
};

const cronExtracurricularCrawling = async () => {
  try {
    await saveSchoolNoticeToDB();
    await saveLanguageNoticeToDB();
    await saveWhalebeToDB();
  } catch (error) {
    notificationToSlack(error.message);
    cronExtracurricularCrawling();
  }
};

cron.schedule('0 0-9 * * 1-5', async () => {
  cronNoticeCrawling();
});

cron.schedule('30 3 * * 1-5', async () => {
  cronExtracurricularCrawling();
});
