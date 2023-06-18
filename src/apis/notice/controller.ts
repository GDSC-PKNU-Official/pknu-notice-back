import { getNotices } from '@apis/notice/service';
import express, { Request, Response } from 'express';

const router = express.Router();
router.get('/:major', async (req: Request, res: Response) => {
  try {
    const notices = await getNotices(req.params.major);
    res.json(notices);
  } catch (err) {
    console.log(err);
  }
});

export default router;
