import db from '@db/index';

interface UserPushInfo {
  endpoint: string;
  expirationTime: string | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const subscribeMajor = async (
  subscription: UserPushInfo,
  major: string,
) => {
  console.log(subscription, major);
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
