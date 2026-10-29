import { Router } from 'express';
import { getDatabaseStatus } from '../config/database.js';

const router = Router();

router.get('/health', (req, res) => {
  const dbStatus = getDatabaseStatus();
  const isHealthy = dbStatus === 'connected';

  res.status(200).json({
    status: isHealthy ? 'ok' : 'degraded',
    database: dbStatus,
    service: 'ai-mystery-room-server',
    timestamp: new Date().toISOString(),
  });
});

export default router;
