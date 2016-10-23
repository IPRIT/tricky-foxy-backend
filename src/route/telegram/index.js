import express from 'express';
import webhook from './webhook';
import * as methods from './methods';

const router = express.Router();

router.use('/telegram', webhook);
router.get('/getMe', methods.getMe);
router.get('/getLocalLeaderboard', methods.getLocalLeaderboard);
router.get('/getGlobalLeaderboard', methods.getGlobalLeaderboard);
router.post('/expandScore', methods.expandScore);

export default router;