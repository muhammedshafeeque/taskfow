import mongoose, { Document, Schema } from 'mongoose';

export interface IRoadmap extends Document {
  project: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  milestoneIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const roadmapSchema = new Schema<IRoadmap>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    startDate: { type: Date },
    endDate: { type: Date },
    milestoneIds: { type: [Schema.Types.ObjectId], ref: 'Milestone', default: [] },
  },
  { timestamps: true }
);

roadmapSchema.index({ project: 1 });

export const Roadmap = mongoose.model<IRoadmap>('Roadmap', roadmapSchema);
