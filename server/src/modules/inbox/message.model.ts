import mongoose, { Document, Schema } from 'mongoose';

export interface IInboxMessage extends Document {
  toUser: mongoose.Types.ObjectId;
  type: string;
  title: string;
  body: string;
  readAt?: Date;
  meta?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IInboxMessage>(
  {
    toUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    readAt: { type: Date, default: null },
    meta: { type: Schema.Types.Mixed, default: undefined },
  },
  { timestamps: true }
);

messageSchema.index({ toUser: 1, createdAt: -1 });

export const InboxMessage = mongoose.model<IInboxMessage>('InboxMessage', messageSchema);
