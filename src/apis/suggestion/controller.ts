import express, { Request, Response } from 'express';
import { postSuggestion } from 'src/utils/notion';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  const { content } = req.body;
  console.log(content);
  try {
    const postResult = await postSuggestion(content);
    res.json(postResult);
  } catch (err) {
    console.log(err);
  }
});

export default router;
