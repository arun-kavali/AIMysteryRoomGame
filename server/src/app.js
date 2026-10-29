import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import healthRoutes from './routes/health.routes.js';
import casesRoutes from './routes/cases.routes.js';
import { notFoundHandler } from './middleware/not-found.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();

// Parse configured allowed origins from CLIENT_URL
const configuredOrigins = env.CLIENT_URL
  ? env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/$/, ''))
  : [];

// Development fallback origins (only active in non-production)
const devOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];

const allowedOrigins = new Set([
  ...configuredOrigins,
  ...(env.NODE_ENV !== 'production' ? devOrigins : []),
]);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server health probes)
      if (!origin) {
        return callback(null, true);
      }

      // Check against explicit allowed origin set
      if (allowedOrigins.has('*') || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`Origin '${origin}' is not authorized by the backend CORS configuration.`)
      );
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing
app.use(express.json({ limit: '1mb' }));

// Mount API routes
app.use('/api', healthRoutes);
app.use('/api', casesRoutes);

// Catch unknown routes
app.use(notFoundHandler);

// Central error handler
app.use(errorHandler);

export default app;
