import express, { Request, Response } from 'express';

import { getGraduationLink } from './service';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const major = req.query.major as string;
    if (major === undefined) {
      throw new Error('전공을 선택해주세요!');
    }
    const graduationLink = await getGraduationLink(major);
    return res.json(graduationLink);
  } catch (err) {
    console.log(err);
  }
});

export default router;
