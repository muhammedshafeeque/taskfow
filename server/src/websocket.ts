import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from './config/env';

let io: Server | null = null;

export function initWebSocket(server: HttpServer): void {
  io = new Server(server, {
    cors: { origin: env.appUrl || true },
    path: '/socket.io',
  });

  io.use((socket: Socket, next) => {
    const token =
      (socket.handshake.auth?.token as string) ||
      (socket.handshake.query?.token as string);
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, env.jwtSecret) as { sub?: string };
      if (!decoded.sub) return next(new Error('Invalid token'));
      (socket as Socket & { userId: string }).userId = decoded.sub;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as Socket & { userId?: string }).userId;
    if (userId) socket.join(userId);
  });
}

export function notifyInboxNew(userId: string, message: Record<string, unknown>): void {
  if (io) io.to(userId).emit('inbox:new', message);
}

export function notifyPush(
  userId: string,
  payload: { title: string; body?: string; url?: string; data?: Record<string, unknown> }
): void {
  if (io) io.to(userId).emit('notification:push', payload);
}
