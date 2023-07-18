import { getNotices } from '@apis/notice/service';
import express, { Request, Response } from 'express';

const router = express.Router();
router.get('/', async (req: Request, res: Response) => {
  try {
    const major = req.query.major as string;
    if (major === undefined) {
      res.status(404).json('학과를 입력해주세요');
    }
    const notices = await getNotices(major);
    res.json(notices);
  } catch (err) {
    console.log(err);
  }
});

export default router;
