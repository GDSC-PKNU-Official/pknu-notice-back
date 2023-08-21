import env from '@config';
import axios from 'axios';

const notificationToSlack = (text: string) => {
  axios.post(env.SLACK_WEBHOOK_URL, {
    Headers: {
      'Content-type': 'application/json',
    },
    text,
  });
};

export default notificationToSlack;
