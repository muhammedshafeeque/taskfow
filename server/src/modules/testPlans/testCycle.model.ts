import mongoose, { Document, Schema } from 'mongoose';

export type TestCycleStatus = 'draft' | 'in_progress' | 'completed';

export interface ITestCycle extends Document {
  testPlan: mongoose.Types.ObjectId;
  name: string;
  startDate?: Date;
  endDate?: Date;
  status: TestCycleStatus;
  createdAt: Date;
  updatedAt: Date;
}

const testCycleSchema = new Schema<ITestCycle>(
  {
    testPlan: { type: Schema.Types.ObjectId, ref: 'TestPlan', required: true },
    name: { type: String, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, enum: ['draft', 'in_progress', 'completed'], default: 'draft' },
  },
  { timestamps: true }
);

testCycleSchema.index({ testPlan: 1 });

export const TestCycle = mongoose.model<ITestCycle>('TestCycle', testCycleSchema);
