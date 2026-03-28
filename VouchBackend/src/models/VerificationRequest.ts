import mongoose, { Document, Schema } from 'mongoose';
import { VERIFY_STATUS } from '../utils/constants';

export interface IVerificationRequest extends Document {
  professionalUserId: mongoose.Types.ObjectId;
  docUrls: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  submittedAt: Date;
  reviewedAt?: Date;
}

const verificationRequestSchema = new Schema<IVerificationRequest>(
  {
    professionalUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    docUrls: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length >= 1 && v.length <= 3,
        message: 'Must upload between 1 and 3 documents',
      },
    },
    status: {
      type: String,
      enum: Object.values(VERIFY_STATUS),
      default: VERIFY_STATUS.PENDING,
    },
    adminNote: { type: String, trim: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
  },
  { timestamps: false },
);

export const VerificationRequest = mongoose.model<IVerificationRequest>(
  'VerificationRequest',
  verificationRequestSchema,
);
