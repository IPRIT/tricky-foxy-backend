import express from 'express';
import cors from './cors';

const router = express.Router();

router.all('*', cors);

export default router;