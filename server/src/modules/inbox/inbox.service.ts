import { InboxMessage } from './message.model';
import { notifyInboxNew } from '../../websocket';
import { ProjectInvitation } from '../projects/projectInvitation.model';

export async function listForUser(userId: string, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    InboxMessage.find({ toUser: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    InboxMessage.countDocuments({ toUser: userId }),
  ]);

  const invitationIds = data
    .filter((msg) => msg.type === 'project_invitation' && msg.meta && typeof msg.meta === 'object' && 'invitationId' in msg.meta)
    .map((msg) => String((msg.meta as { invitationId?: unknown }).invitationId))
    .filter((id) => id && id !== 'undefined' && id !== 'null');

  let invitationStatusById = new Map<string, string>();
  if (invitationIds.length > 0) {
    const invitations = await ProjectInvitation.find({ _id: { $in: invitationIds } })
      .select('_id status')
      .lean();
    invitationStatusById = new Map(
      invitations.map((inv) => [String(inv._id), String((inv as { status?: string }).status ?? '')])
    );
  }

  const enrichedData = data.map((msg) => {
    if (msg.type !== 'project_invitation' || !msg.meta || typeof msg.meta !== 'object') return msg;
    const invitationId = String((msg.meta as { invitationId?: unknown }).invitationId ?? '');
    if (!invitationId) return msg;
    const latestStatus = invitationStatusById.get(invitationId);
    if (!latestStatus) return msg;
    return {
      ...msg,
      meta: {
        ...(msg.meta as Record<string, unknown>),
        status: latestStatus,
      },
    };
  });

  return {
    data: enrichedData,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function unreadCount(userId: string): Promise<number> {
  return InboxMessage.countDocuments({ toUser: userId, readAt: null });
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
