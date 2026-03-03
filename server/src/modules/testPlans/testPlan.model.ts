import mongoose, { Document, Schema } from 'mongoose';

export interface ITestPlan extends Document {
  project: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  testCaseIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const testPlanSchema = new Schema<ITestPlan>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    testCaseIds: [{ type: Schema.Types.ObjectId, ref: 'TestCase' }],
  },
  { timestamps: true }
);

testPlanSchema.index({ project: 1 });

export const TestPlan = mongoose.model<ITestPlan>('TestPlan', testPlanSchema);
