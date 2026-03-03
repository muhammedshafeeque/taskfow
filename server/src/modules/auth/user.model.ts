import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'user' | 'admin';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  roleId?: mongoose.Types.ObjectId;
  designation?: mongoose.Types.ObjectId;
  enabled: boolean;
  mustChangePassword: boolean;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true },
    avatarUrl: { type: String, default: null },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    roleId: { type: Schema.Types.ObjectId, ref: 'Role', default: null },
    designation: { type: Schema.Types.ObjectId, ref: 'Designation', default: null },
    enabled: { type: Boolean, default: true },
    mustChangePassword: { type: Boolean, default: true },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
