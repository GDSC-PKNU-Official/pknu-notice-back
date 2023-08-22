import env from '@config';
import axios from 'axios';

const notificationToSlack = async (text: string): Promise<void> => {
  if (process.env.NODE_ENV === 'development') {
    console.error(text);
    return;
  }
  await axios.post(env.SLACK_WEBHOOK_URL, {
    Headers: {
      'Content-type': 'application/json',
    },
    text,
  });
  return;
};

export default notificationToSlack;
