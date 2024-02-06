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

const cronNoticeCrawling = async (reTryCount = 0) => {
  try {
    const pushNotiToUserLists = await saveMajorNoticeToDB();
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // 월은 0부터 시작하므로 1을 더해줍니다.
    const day = today.getDate();
    notificationToSlack(`${year}-${month}-${day} 크롤링 완료`);
    pushToUsers(pushNotiToUserLists);
  } catch (error) {
    if (reTryCount >= 2) {
      notificationToSlack(error.message);
      return;
    }
    cronNoticeCrawling(reTryCount + 1);
  }
};

const cronExtracurricularCrawling = async (reTryCount = 0) => {
  try {
    await saveSchoolNoticeToDB();
    await saveLanguageNoticeToDB();
    await saveWhalebeToDB();
  } catch (error) {
    if (reTryCount >= 2) {
      notificationToSlack(error.message);
      return;
    }
    cronExtracurricularCrawling();
  }
};

cron.schedule('0 0-9/2 * * 1-5', async () => {
  cronNoticeCrawling();
});

cron.schedule('30 3 * * 1-5', async () => {
  cronExtracurricularCrawling();
});
