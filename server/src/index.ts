import http from 'http';
import app from './app';
import { connectDb } from './config/db';
import { env } from './config/env';
import { initWebSocket } from './websocket';

async function start(): Promise<void> {
  await connectDb();

  const server = http.createServer(app);
  initWebSocket(server);

  server.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
