import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkLog extends Document {
  issue: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  minutesSpent: number;
  date: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const workLogSchema = new Schema<IWorkLog>(
  {
    issue: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    minutesSpent: { type: Number, required: true, min: 1 },
    date: { type: Date, required: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

workLogSchema.index({ issue: 1 });
workLogSchema.index({ author: 1, date: 1 });

export const WorkLog = mongoose.model<IWorkLog>('WorkLog', workLogSchema);

