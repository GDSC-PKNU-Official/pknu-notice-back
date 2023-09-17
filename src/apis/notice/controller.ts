import { getNotices, getSchoolNotices, getWhalebe } from '@apis/notice/service';
import express, { Request, Response } from 'express';

const router = express.Router();
router.get('/', async (req: Request, res: Response) => {
  try {
    const major = req.query.major as string;
    let notices;
    if (major === undefined) {
      notices = await getSchoolNotices();
    } else {
      notices = await getNotices(major);
    }
    res.json(notices);
  } catch (err) {
    console.log(err);
  }
});

router.get('/whalebe', async (req: Request, res: Response) => {
  try {
    const whalebeData = await getWhalebe();
    res.json(whalebeData);
  } catch (err) {
    res.json();
  }
});

export default router;
