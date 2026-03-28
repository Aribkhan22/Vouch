import mongoose, { Document, Schema } from 'mongoose';
import { REQUEST_STATUS, SERVICE_CATEGORIES } from '../utils/constants';

export interface IServiceRequest extends Document {
  createdByStartupUserId: mongoose.Types.ObjectId;
  category: string;
  description: string;
  city: string;
  budgetRange: string;
  status: 'OPEN' | 'ACCEPTED' | 'CLOSED';
  assignedProfessionalUserId?: mongoose.Types.ObjectId;
  createdAt: Date;
  acceptedAt?: Date;
  closedAt?: Date;
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
    acceptedAt: { type: Date },
    closedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

serviceRequestSchema.index({ status: 1, city: 1 });

export const ServiceRequest = mongoose.model<IServiceRequest>(
  'ServiceRequest',
  serviceRequestSchema,
);
