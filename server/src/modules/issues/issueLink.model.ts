import mongoose, { Document, Schema } from 'mongoose';

/** Stored link types (IssueLink documents). */
export type IssueLinkType = 'blocks' | 'is_blocked_by' | 'duplicates' | 'is_duplicated_by' | 'relates_to';

/**
 * `is_subtask_of` is returned only for virtual links derived from Issue.parent (not persisted on IssueLink).
 */
export type IssueLinkResponseType = IssueLinkType | 'is_subtask_of';

export interface IIssueLink extends Document {
  sourceIssue: mongoose.Types.ObjectId;
  targetIssue: mongoose.Types.ObjectId;
  linkType: IssueLinkType;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const issueLinkSchema = new Schema<IIssueLink>(
  {
    sourceIssue: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
    targetIssue: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
    linkType: {
      type: String,
      required: true,
      enum: ['blocks', 'is_blocked_by', 'duplicates', 'is_duplicated_by', 'relates_to'],
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

issueLinkSchema.index({ sourceIssue: 1, targetIssue: 1, linkType: 1 }, { unique: true });
issueLinkSchema.index({ targetIssue: 1 });

export const IssueLink = mongoose.model<IIssueLink>('IssueLink', issueLinkSchema);
