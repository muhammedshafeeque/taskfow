import mongoose, { Document, Schema } from 'mongoose';

export interface ITestCase extends Document {
  project: mongoose.Types.ObjectId;
  title: string;
  steps?: string;
  expectedResult?: string;
  status: string;
  priority: string;
  type: string;
  linkedIssueId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const testCaseSchema = new Schema<ITestCase>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true },
    steps: { type: String, default: '' },
    expectedResult: { type: String, default: '' },
    status: { type: String, default: 'draft' },
    priority: { type: String, default: 'medium' },
    type: { type: String, default: 'functional' },
    linkedIssueId: { type: Schema.Types.ObjectId, ref: 'Issue' },
  },
  { timestamps: true }
);

testCaseSchema.index({ project: 1 });
testCaseSchema.index({ linkedIssueId: 1 });

export const TestCase = mongoose.model<ITestCase>('TestCase', testCaseSchema);
