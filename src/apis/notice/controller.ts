import {
  getLanguage,
  getNotices,
  getRecruit,
  getSchoolNotices,
  getWhalebe,
} from '@apis/notice/service';
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

router.get('/language', async (req: Request, res: Response) => {
  try {
    const languageNoti = await getLanguage();
    res.json(languageNoti);
  } catch (err) {
    res.json();
  }
});

router.get('/recruit', async (req: Request, res: Response) => {
  try {
    const recruitData = await getRecruit();
    res.json(recruitData);
  } catch (err) {
    res.json();
  }
});

export default router;
