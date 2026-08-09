import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      required: true,
    },
    targetId: {
      type: String,
      required: true,
    },
    before: {
      type: mongoose.Schema.Types.Mixed,
    },
    after: {
      type: mongoose.Schema.Types.Mixed,
    },
    ip: String,
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

export const AuditLog =
  mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
