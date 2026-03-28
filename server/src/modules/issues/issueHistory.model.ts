import mongoose, { Schema, Document } from 'mongoose';

export type IssueHistoryAction = 'created' | 'field_change' | 'comment_added' | 'comment_updated';

export interface IIssueHistory extends Document {
  issue: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  action: IssueHistoryAction;
  field?: string;
  fromValue?: unknown;
  toValue?: unknown;
  commentId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const issueHistorySchema = new Schema<IIssueHistory>(
  {
    issue: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['created', 'field_change', 'comment_added', 'comment_updated'], required: true },
    field: { type: String },
    fromValue: { type: Schema.Types.Mixed },
    toValue: { type: Schema.Types.Mixed },
    commentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

issueHistorySchema.index({ issue: 1, createdAt: -1 });
issueHistorySchema.index({ author: 1, createdAt: -1 });

export const IssueHistory = mongoose.model<IIssueHistory>('IssueHistory', issueHistorySchema);
