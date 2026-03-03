import mongoose, { Document, Schema } from 'mongoose';

export interface IUsageEvent extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  resourceType?: string;
  projectId?: mongoose.Types.ObjectId;
  meta?: Record<string, unknown>;
  createdAt: Date;
}

const usageEventSchema = new Schema<IUsageEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    resourceType: { type: String },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

usageEventSchema.index({ createdAt: -1 });
usageEventSchema.index({ userId: 1, createdAt: -1 });
usageEventSchema.index({ action: 1, createdAt: -1 });

export const UsageEvent = mongoose.model<IUsageEvent>('UsageEvent', usageEventSchema);
