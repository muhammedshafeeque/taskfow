import express from 'express';
import passport from 'passport';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { apiRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import morgan from 'morgan';
import { env } from './config/env';

const app = express();

app.use(passport.initialize());

// Allow the frontend (different origin in dev) to load uploaded images/videos.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
const allowedOrigins = Array.from(
  new Set(
    [env.appUrl, process.env.FRONTEND_URL]
      .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
      .map((v) => v.trim())
  )
);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin / non-browser requests.
      if (!origin) return cb(null, true);
      if (allowedOrigins.length === 0) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Organization-Id'],
  })
);
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api', apiRoutes);

app.use(errorHandler);

export default app;
