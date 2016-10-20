import express from 'express';
import telegram from './telegram';
import cors from './cors';

const router = express.Router();

router.all('*', cors);

router.use('/game-api', telegram);

export default router;