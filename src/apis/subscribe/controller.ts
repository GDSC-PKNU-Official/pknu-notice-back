import { subscribeMajor, unsubscribeMajor } from '@apis/subscribe/service';
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
    const { subscription, major } = req.body;
    await unsubscribeMajor(subscription, major);
  } catch (error) {
    console.error(error);
  } finally {
    res.status(200).json();
  }
});

// router.post('/push', async (req: Request, res: Response) => {
//   try {
//     const { major } = req.body.data;
//     pushNotification(major);
//   } catch (error) {
//     console.error(error);
//   } finally {
//     res.status(200).json();
//   }
// });

export default router;
