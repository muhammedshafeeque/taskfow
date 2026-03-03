import mongoose from 'mongoose';
import { UsageEvent } from './usageEvent.model';

export async function logEvent(
  userId: string,
  action: string,
  resourceType?: string,
  projectId?: string,
  meta?: Record<string, unknown>
): Promise<void> {
  await UsageEvent.create({
    userId: new mongoose.Types.ObjectId(userId),
    action,
    resourceType: resourceType ?? undefined,
    projectId: projectId ? new mongoose.Types.ObjectId(projectId) : undefined,
    meta: meta ?? undefined,
  });
}

export interface UsageStats {
  dailyActiveUsers: Array<{ date: string; count: number }>;
  actionsByType: Array<{ action: string; count: number }>;
  topUsers: Array<{ userId: string; userName: string; count: number }>;
}

export async function getUsageStats(from: Date, to: Date): Promise<UsageStats> {
  const fromStart = new Date(from);
  fromStart.setHours(0, 0, 0, 0);
  const toEnd = new Date(to);
  toEnd.setHours(23, 59, 59, 999);

  const [dauAgg, actionAgg, userAgg] = await Promise.all([
    UsageEvent.aggregate<{ _id: { year: number; month: number; day: number }; count: number }>([
      { $match: { createdAt: { $gte: fromStart, $lte: toEnd } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          uniqueUsers: { $addToSet: '$userId' },
        },
      },
      { $project: { _id: 1, count: { $size: '$uniqueUsers' } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]),
    UsageEvent.aggregate<{ _id: string; count: number }>([
      { $match: { createdAt: { $gte: fromStart, $lte: toEnd } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    UsageEvent.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      { $match: { createdAt: { $gte: fromStart, $lte: toEnd } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]),
  ]);

  const dailyActiveUsers = dauAgg.map((r) => ({
    date: `${r._id.year}-${String(r._id.month).padStart(2, '0')}-${String(r._id.day).padStart(2, '0')}`,
    count: r.count,
  }));

  const actionsByType = actionAgg.map((r) => ({ action: r._id, count: r.count }));

  const userIds = userAgg.map((r) => r._id);
  const { User } = await import('../auth/user.model');
  const users = userIds.length > 0
    ? await User.find({ _id: { $in: userIds } }).select('name').lean()
    : [];
  const userMap = new Map(users.map((u) => [String(u._id), (u as { name: string }).name]));

  const topUsers = userAgg.map((r) => ({
    userId: String(r._id),
    userName: userMap.get(String(r._id)) ?? 'Unknown',
    count: r.count,
  }));

  return {
    dailyActiveUsers,
    actionsByType,
    topUsers,
  };
}
