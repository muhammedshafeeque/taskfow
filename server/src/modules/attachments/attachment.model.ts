import mongoose, { Document, Schema } from 'mongoose';

export interface IAttachment extends Document {
  issue: mongoose.Types.ObjectId;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const attachmentSchema = new Schema<IAttachment>(
  {
    issue: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
    url: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

attachmentSchema.index({ issue: 1 });

export const Attachment = mongoose.model<IAttachment>('Attachment', attachmentSchema);
