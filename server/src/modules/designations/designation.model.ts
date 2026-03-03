import mongoose, { Document, Schema } from 'mongoose';

export interface IDesignation extends Document {
  name: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const designationSchema = new Schema<IDesignation>(
  {
    name: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Designation = mongoose.model<IDesignation>('Designation', designationSchema);
