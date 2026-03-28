import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  requestId: mongoose.Types.ObjectId;
  startupUserId: mongoose.Types.ObjectId;
  professionalUserId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    requestId: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceRequest',
      required: true,
      unique: true,
    },
    startupUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    professionalUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Chat = mongoose.model<IChat>('Chat', chatSchema);
