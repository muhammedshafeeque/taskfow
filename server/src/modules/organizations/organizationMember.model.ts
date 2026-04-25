import mongoose, { Document, Schema } from 'mongoose';

export type OrganizationMemberRole = 'org_admin' | 'org_member';
export type OrganizationMemberStatus = 'active' | 'invited';

export interface IOrganizationMember extends Document {
  organization: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  role: OrganizationMemberRole;
  status: OrganizationMemberStatus;
  invitedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const organizationMemberSchema = new Schema<IOrganizationMember>(
  {
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['org_admin', 'org_member'], default: 'org_member' },
    status: { type: String, enum: ['active', 'invited'], default: 'active' },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

organizationMemberSchema.index({ organization: 1, user: 1 }, { unique: true });

export const OrganizationMember = mongoose.model<IOrganizationMember>(
  'OrganizationMember',
  organizationMemberSchema
);
