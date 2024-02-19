import express, { Request, Response } from 'express';

import fetchBuildingInfo from './service';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const code = req.query.code;

  try {
    const buildingInfo = await fetchBuildingInfo(code as string);
    res.json(buildingInfo);
  } catch (err) {
    console.log(err);
  }
});

export default router;
