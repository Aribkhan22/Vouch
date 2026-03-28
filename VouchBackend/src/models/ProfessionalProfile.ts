import mongoose, { Document, Schema } from 'mongoose';

export interface IProfessionalProfile extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  professionType: 'LAWYER' | 'CA';
  city: string;
  experienceYears: number;
  specializations: string[];
  licenseNumber: string;
  feeRange?: string;
  isVerified: boolean;
  createdAt: Date;
}

const professionalProfileSchema = new Schema<IProfessionalProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: { type: String, required: true, trim: true },
    professionType: {
      type: String,
      enum: ['LAWYER', 'CA'],
      required: true,
    },
    city: { type: String, required: true, trim: true },
    experienceYears: { type: Number, required: true, min: 0 },
    specializations: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length <= 5,
        message: 'Maximum 5 specializations allowed',
      },
    },
    licenseNumber: { type: String, required: true, trim: true },
    feeRange: { type: String, trim: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Compound index for directory filtering
professionalProfileSchema.index({ city: 1, professionType: 1, isVerified: 1 });

export const ProfessionalProfile = mongoose.model<IProfessionalProfile>(
  'ProfessionalProfile',
  professionalProfileSchema,
);
