import db from '@db/index';
import notificationToSlack from 'src/hooks/notificateToSlack';
import webpush from 'web-push';

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
  return new Promise<boolean>((resolve, reject) => {
    try {
      const subscribeMajorQuery =
        'INSERT INTO ' + major + '구독 (user) VALUES (?)';

      db.query(subscribeMajorQuery, [JSON.stringify(subscription)], (error) => {
        if (error) {
          console.error('구독 실패');
          reject(false);
        } else {
          console.log('구독 성공');
          resolve(true);
        }
      });
    } catch (error) {
      console.error(error);
      reject(false);
    }
  });
};

export const unsubscribeMajor = async (
  subscription: UserPushInfo,
  major: string,
) => {
  return new Promise<boolean>((resolve, reject) => {
    try {
      const unSubscribeMajorQuery = `DELETE FROM ${major}구독 WHERE user like '%${subscription.endpoint}%'`;
      db.query(unSubscribeMajorQuery, (error, res) => {
        if (error) {
          console.error('구독취소 실패');
          reject(false);
        }
        console.log('구독취소 성공');
        resolve(true);
      });
    } catch (error) {
      console.error(error);
    }
  });
};

export const pushNotification = (major: string): Promise<number> => {
  const query = `SELECT user FROM ${major}구독`;
  return new Promise<number>((resolve) => {
    db.query(query, async (err: Error, res: SubscribeUser[]) => {
      if (err) console.error(err);

      const message: PushMessage = {
        title: `${major} 알림`,
        body: '새로운 공지가 추가됐어요',
        icon: './icons/icon-192x192.png',
      };

      for (const userInfo of res) {
        try {
          await webpush.sendNotification(
            JSON.parse(userInfo.user),
            JSON.stringify(message),
          );
        } catch (error) {
          notificationToSlack(error);
          const deleteQuery = `DELETE FROM ${major}구독 WHERE user = ?`;
          db.query(deleteQuery, [userInfo.user], (deleteErr) => {
            if (deleteErr)
              notificationToSlack('알림 보낼 수 없는 토큰 삭제 실패');
            else console.log('알림 보낼 수 없는 토큰 삭제');
          });
        }
        resolve(res.length);

        resolve(0);
      }
    });
  });
};
