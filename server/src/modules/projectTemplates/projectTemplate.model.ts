import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProjectTemplate extends Document {
  /** Workspace that owns this template (custom templates only; built-in is virtual). */
  taskflowOrganizationId?: Types.ObjectId;
  name: string;
  description?: string;
  statuses: Array<{ id: string; name: string; order: number; isClosed?: boolean; icon?: string; color?: string; fontColor?: string }>;
  issueTypes: Array<{ id: string; name: string; order: number; icon?: string; color?: string; fontColor?: string }>;
  priorities: Array<{ id: string; name: string; order: number; icon?: string; color?: string; fontColor?: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const statusSchema = new Schema(
  { id: String, name: String, order: Number, isClosed: Boolean, icon: String, color: String, fontColor: String },
  { _id: false }
);
const issueTypeSchema = new Schema(
  { id: String, name: String, order: Number, icon: String, color: String, fontColor: String },
  { _id: false }
);
const prioritySchema = new Schema(
  { id: String, name: String, order: Number, icon: String, color: String, fontColor: String },
  { _id: false }
);

const projectTemplateSchema = new Schema<IProjectTemplate>(
  {
    taskflowOrganizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    statuses: { type: [statusSchema], default: [] },
    issueTypes: { type: [issueTypeSchema], default: [] },
    priorities: { type: [prioritySchema], default: [] },
  },
  { timestamps: true }
);

projectTemplateSchema.index({ taskflowOrganizationId: 1, name: 1 });

export const ProjectTemplate = mongoose.model<IProjectTemplate>('ProjectTemplate', projectTemplateSchema);
