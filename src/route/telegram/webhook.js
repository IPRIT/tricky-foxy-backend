import express from 'express';
import { config } from '../../utils';
import { telegram } from '../../utils/telegram';

const router = express.Router();

router.all(`/${config.telegram.webhook}`, (req, res, next) => {
  let { body } = req;
  console.log(body);
  telegram.handle(body).then(() => {
    res.json({
      status: 200
    });
  }).catch(next);
});

export default router;