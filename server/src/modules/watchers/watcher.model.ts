import mongoose, { Document, Schema } from 'mongoose';

export interface IWatcher extends Document {
  issue: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
}

const watcherSchema = new Schema<IWatcher>(
  {
    issue: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

watcherSchema.index({ issue: 1, user: 1 }, { unique: true });
watcherSchema.index({ user: 1 });

export const Watcher = mongoose.model<IWatcher>('Watcher', watcherSchema);
