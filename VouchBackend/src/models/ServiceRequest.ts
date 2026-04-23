import mongoose, { Document, Schema } from 'mongoose';
import { REQUEST_STATUS, SERVICE_CATEGORIES } from '../utils/constants';

export interface IServiceRequest extends Document {
  createdByStartupUserId: mongoose.Types.ObjectId;
  category: string;
  description: string;
  city: string;
  budgetRange: string;
  status: 'OPEN' | 'ACCEPTED' | 'CLOSED' | 'REJECTED';
  assignedProfessionalUserId?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  createdAt: Date;
  acceptedAt?: Date;
  closedAt?: Date;
  rejectedAt?: Date;
  endRequestedByStartup: boolean;
  endRequestedByProfessional: boolean;
}

const serviceRequestSchema = new Schema<IServiceRequest>(
  {
    createdByStartupUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: SERVICE_CATEGORIES,
      required: true,
    },
    description: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    budgetRange: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: Object.values(REQUEST_STATUS),
      default: REQUEST_STATUS.OPEN,
    },
    assignedProfessionalUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String, trim: true },
    acceptedAt: { type: Date },
    closedAt: { type: Date },
    rejectedAt: { type: Date },
    endRequestedByStartup: { type: Boolean, default: false },
    endRequestedByProfessional: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

serviceRequestSchema.index({ status: 1, city: 1 });

export const ServiceRequest = mongoose.model<IServiceRequest>(
  'ServiceRequest',
  serviceRequestSchema,
);
