import mongoose, { Document, Schema } from 'mongoose';

export type TestRunStatus = 'pending' | 'pass' | 'fail' | 'blocked' | 'skip';

export interface ITestRun extends Document {
  testCycle: mongoose.Types.ObjectId;
  testCase: mongoose.Types.ObjectId;
  assignee?: mongoose.Types.ObjectId;
  status: TestRunStatus;
  result?: string;
  executedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const testRunSchema = new Schema<ITestRun>(
  {
    testCycle: { type: Schema.Types.ObjectId, ref: 'TestCycle', required: true },
    testCase: { type: Schema.Types.ObjectId, ref: 'TestCase', required: true },
    assignee: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'pass', 'fail', 'blocked', 'skip'], default: 'pending' },
    result: { type: String },
    executedAt: { type: Date },
  },
  { timestamps: true }
);

testRunSchema.index({ testCycle: 1, testCase: 1 }, { unique: true });

export const TestRun = mongoose.model<ITestRun>('TestRun', testRunSchema);
