import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';

async function startServer() {
  console.log(`[AI Mystery Room Server] Starting in ${env.NODE_ENV} mode...`);

  // Attempt database connection (logs warning if not configured, without blocking server boot)
  await connectDatabase();

  const server = app.listen(env.PORT, () => {
    console.log(`[AI Mystery Room Server] Listening on http://localhost:${env.PORT}`);
    console.log(`[AI Mystery Room Server] Health check: http://localhost:${env.PORT}/api/health`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('[AI Mystery Room Server] Shutting down gracefully...');
    server.close(() => {
      console.log('[AI Mystery Room Server] Closed active connections.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer();

