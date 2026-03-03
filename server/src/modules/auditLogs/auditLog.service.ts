import { AuditLog } from './auditLog.model';

export interface CreateAuditLogInput {
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  projectId?: string;
  meta?: Record<string, unknown>;
  ip?: string;
}

export async function create(input: CreateAuditLogInput): Promise<void> {
  await AuditLog.create({
    user: input.userId,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    projectId: input.projectId,
    meta: input.meta,
    ip: input.ip,
  });
}

export interface ListAuditLogsFilters {
  user?: string;
  action?: string;
  resourceType?: string;
  projectId?: string;
}

export interface ListAuditLogsOptions {
  page?: number;
  limit?: number;
}

export async function findAll(
  filters: ListAuditLogsFilters = {},
  opts: ListAuditLogsOptions = {}
): Promise<{ data: unknown[]; total: number; page: number; limit: number; totalPages: number }> {
  const { page = 1, limit = 50 } = opts;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (filters.user) filter.user = filters.user;
  if (filters.action) filter.action = filters.action;
  if (filters.resourceType) filter.resourceType = filters.resourceType;
  if (filters.projectId) filter.projectId = filters.projectId;

  const [data, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('user', 'name email')
      .populate('projectId', 'name key')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(filter),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
