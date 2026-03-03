import * as auditLogService from './auditLog.service';

export function logAudit(input: {
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  projectId?: string;
  meta?: Record<string, unknown>;
  ip?: string;
}): void {
  auditLogService.create(input).catch((err) => {
    console.error('[AuditLog] Failed to write audit log:', err);
  });
}
