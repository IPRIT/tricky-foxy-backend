import express from 'express';
import { config } from '../../utils';

const router = express.Router();

router.all(`/${config.telegram.webhook}`, (req, res, next) => {
  console.log(req.body);
  res.json({
    status: 200
  });
});

export default router;