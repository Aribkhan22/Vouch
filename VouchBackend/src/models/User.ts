import mongoose, { Document, Schema } from 'mongoose';
import { ROLES, USER_STATUS } from '../utils/constants';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  role: 'STARTUP' | 'LAWYER' | 'CA' | 'ADMIN';
  name: string;
  email: string;
  passwordHash: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const User = mongoose.model<IUser>('User', userSchema);
