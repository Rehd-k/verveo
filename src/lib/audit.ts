import { AuditLog } from '@/models/AuditLog';

export async function writeAuditLog(params: {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  before?: unknown;
  after?: unknown;
  ip?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await AuditLog.create({
    actorId: params.actorId,
    action: params.action,
    targetType: params.targetType,
    targetId: params.targetId,
    before: params.before,
    after: params.after,
    ip: params.ip || undefined,
    metadata: params.metadata,
  });
}
