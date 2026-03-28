import mongoose, { Document, Schema } from 'mongoose';

export interface IStartupProfile extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  industry: string;
  city: string;
  description: string;
  createdAt: Date;
}

const startupProfileSchema = new Schema<IStartupProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: { type: String, required: true, trim: true },
    industry: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const StartupProfile = mongoose.model<IStartupProfile>(
  'StartupProfile',
  startupProfileSchema,
);
