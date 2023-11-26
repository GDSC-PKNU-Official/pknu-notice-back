import {
  pushNotification,
  subscribeMajor,
  unsubscribeMajor,
} from '@apis/subscribe/service';
import express, { Request, Response } from 'express';

const router = express.Router();
router.post('/major', async (req: Request, res: Response) => {
  try {
    const { subscription, major } = req.body.data;
    await subscribeMajor(subscription, major);
  } catch (error) {
    console.error(error);
  } finally {
    res.status(200).json();
  }
});

router.delete('/major', async (req: Request, res: Response) => {
  try {
    const { subscription } = req.body;
    await unsubscribeMajor(subscription);
  } catch (error) {
    console.error(error);
  } finally {
    res.status(200).json();
  }
});

// router.post('/push', async (req: Request, res: Response) => {
//   try {
//     const { major } = req.body.data;
//     pushNotification(major, ['안녕', '내 이름은', '곱등이']);
//   } catch (error) {
//     console.error(error);
//   } finally {
//     res.status(200).json();
//   }
// });

export default router;
