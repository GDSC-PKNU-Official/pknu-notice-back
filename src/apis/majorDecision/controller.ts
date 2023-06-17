import { getCollegesName } from '@apis/majorDecision/service';
import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const colleges = await getCollegesName();
    res.json(colleges);
  } catch (err) {
    console.log(err);
  }
});

export default router;
