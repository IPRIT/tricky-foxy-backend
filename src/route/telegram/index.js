import express from 'express';
import webhook from './webhook';

const router = express.Router();

router.use('/telegram', webhook);

export default router;