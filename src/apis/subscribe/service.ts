import db from '@db/index';
import { selectQuery } from '@db/query/dbQueryHandler';
import notificationToSlack from 'src/hooks/notificateToSlack';
import webpush from 'web-push';

import { getDepartmentIdByMajor } from './../../utils/majorUtils';

interface UserPushInfo {
  endpoint: string;
  expirationTime: string | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface PushMessage {
  title: string;
  body: string;
  icon: string;
}

export interface SubscribeUser {
  user: string;
}

export const subscribeMajor = async (
  subscription: UserPushInfo,
  major: string,
) => {
  const majorId = await getDepartmentIdByMajor(major);
  const subscribeMajorQuery =
    'INSERT INTO subscribe_users (user, department_id) VALUES (?, ?)';
  const values = [JSON.stringify(subscription), majorId];

  try {
    await db.execute(subscribeMajorQuery, values);
  } catch (error) {
    notificationToSlack(error.message + '구독 실패');
  }
};

export const unsubscribeMajor = async (subscription: UserPushInfo) => {
  try {
    const unSubscribeMajorQuery = `DELETE FROM subscribe_users WHERE user like '%${subscription.endpoint}%'`;
    await db.execute(unSubscribeMajorQuery);
  } catch (error) {
    notificationToSlack(error.message + '구독 취소 실패');
  }
};

export const pushNotification = async (
  majorId: string,
  noticeTitle: string[],
): Promise<number> => {
  // const majorId = await getDepartmentIdByMajor(major);
  const query = `SELECT user FROM subscribe_users WHERE department_id = ${majorId}`;
  const subscribeUsers = await selectQuery<{ user: string }[]>(query);
  if (!subscribeUsers.length) {
    return 0;
  }

  for (const userInfo of subscribeUsers) {
    for (const lists of noticeTitle) {
      try {
        const message: PushMessage = {
          title: `학과 신규 공지 알림`,
          body: lists,
          icon: './icons/icon-192x192.png',
        };
        await webpush.sendNotification(
          JSON.parse(userInfo.user),
          JSON.stringify(message),
        );
      } catch (error) {
        notificationToSlack(error);
        try {
          const deleteQuery = `DELETE FROM subscribe_users WHERE user = ?`;
          await db.execute(deleteQuery, [userInfo.user]);
          notificationToSlack(error.message + '유저 미존재하여 강제 구독 취소');
        } catch (error) {
          notificationToSlack(error.message + '유저 강제 구독 취소 실패');
        }
      }
    }
  }

  return subscribeUsers.length;
};
