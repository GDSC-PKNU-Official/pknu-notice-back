import env from '@config';
import webpush from 'web-push';

export default (): void => {
  webpush.setVapidDetails(
    `mailto:${env.ROOT_EMAIL}`,
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY,
  );
};
