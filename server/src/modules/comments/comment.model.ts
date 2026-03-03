import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  body: string;
  issue: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    body: { type: String, required: true },
    issue: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

commentSchema.index({ issue: 1 });

export const Comment = mongoose.model<IComment>('Comment', commentSchema);
