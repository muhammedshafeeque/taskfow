import { InboxMessage } from './message.model';
import { notifyInboxNew } from '../../websocket';

export async function listForUser(userId: string, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    InboxMessage.find({ toUser: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    InboxMessage.countDocuments({ toUser: userId }),
  ]);
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function markRead(messageId: string, userId: string) {
  const msg = await InboxMessage.findOneAndUpdate(
    { _id: messageId, toUser: userId },
    { $set: { readAt: new Date() } },
    { new: true }
  ).lean();
  return msg;
}

export async function createMessage(params: {
  toUser: string;
  type: string;
  title: string;
  body?: string;
  meta?: Record<string, unknown>;
}) {
  const msg = await InboxMessage.create(params);
  const payload = msg.toObject();
  notifyInboxNew(params.toUser, payload as unknown as Record<string, unknown>);
  return payload;
}
