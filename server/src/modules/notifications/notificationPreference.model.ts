import mongoose, { Document, Schema } from 'mongoose';
import { NOTIFICATION_EVENTS, type NotificationEventKey, type NotificationMethodState } from '../../shared/constants/notificationCatalog';

export interface INotificationPreference extends Document {
  userId: mongoose.Types.ObjectId;
  preferences: Record<NotificationEventKey, NotificationMethodState>;
  createdAt: Date;
  updatedAt: Date;
}

const methodStateSchema = new Schema<NotificationMethodState>(
  {
    in_app: { type: Boolean, default: true },
    push: { type: Boolean, default: false },
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    whatsapp: { type: Boolean, default: false },
    discord: { type: Boolean, default: false },
    slack: { type: Boolean, default: false },
    teams: { type: Boolean, default: false },
    telegram: { type: Boolean, default: false },
  },
  { _id: false }
);

const prefsShape = Object.fromEntries(
  NOTIFICATION_EVENTS.map((event) => [event, { type: methodStateSchema, default: () => ({}) }])
) as Record<NotificationEventKey, { type: Schema; default: () => Record<string, never> }>;

const notificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    preferences: { type: new Schema(prefsShape, { _id: false }), default: () => ({}) },
  },
  { timestamps: true }
);

export const NotificationPreference = mongoose.model<INotificationPreference>(
  'NotificationPreference',
  notificationPreferenceSchema
);
