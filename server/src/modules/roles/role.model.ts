import mongoose, { Document, Schema } from 'mongoose';

export interface IRole extends Document {
  name: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, trim: true },
    permissions: [{ type: String, required: true }],
  },
  { timestamps: true }
);

export const Role = mongoose.model<IRole>('Role', roleSchema);
