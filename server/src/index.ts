import http from 'http';
import app from './app';
import { connectDb } from './config/db';
import { env } from './config/env';
import { initWebSocket } from './websocket';

connectDb();

  const server = http.createServer(app);
  initWebSocket(server);

  server.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });

