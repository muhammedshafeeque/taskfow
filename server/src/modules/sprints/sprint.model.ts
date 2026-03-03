import mongoose, { Document, Schema } from 'mongoose';

export type SprintStatus = 'planned' | 'active' | 'completed';

export interface ISprint extends Document {
  name: string;
  project: mongoose.Types.ObjectId;
  board: mongoose.Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  status: SprintStatus;
  createdAt: Date;
  updatedAt: Date;
}

const sprintSchema = new Schema<ISprint>(
  {
    name: { type: String, required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    board: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ['planned', 'active', 'completed'],
      default: 'planned',
    },
  },
  { timestamps: true }
);

sprintSchema.index({ project: 1, status: 1 });
sprintSchema.index({ board: 1 });

export const Sprint = mongoose.model<ISprint>('Sprint', sprintSchema);
