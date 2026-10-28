import { Router } from 'express';
import { getDatabaseStatus } from '../config/database.js';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    database: getDatabaseStatus(),
    service: 'ai-mystery-room-server',
    timestamp: new Date().toISOString(),
  });
});

export default router;

