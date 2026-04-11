import { Chat } from '../models/Chat';
import { Message } from '../models/Message';
import { StartupProfile } from '../models/StartupProfile';
import { ProfessionalProfile } from '../models/ProfessionalProfile';
import { User } from '../models/User';

const assertParticipant = (
  chat: { startupUserId: unknown; professionalUserId: unknown },
  userId: string,
) => {
  const ids = [chat.startupUserId?.toString(), chat.professionalUserId?.toString()];
  if (!ids.includes(userId)) {
    throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
  }
};

export const getChatByRequest = async (requestId: string, userId: string) => {
  const chat = await Chat.findOne({ requestId });
  if (!chat) throw Object.assign(new Error('Chat not found'), { statusCode: 404 });
  assertParticipant(chat, userId);
  return chat;
};

export const getChatById = async (chatId: string, userId: string) => {
  const chat = await Chat.findById(chatId);
  if (!chat) throw Object.assign(new Error('Chat not found'), { statusCode: 404 });
  assertParticipant(chat, userId);

  // Fetch both participant profiles concurrently to enrich the response
  const [startupProfile, professionalProfile, startupUser] = await Promise.all([
    StartupProfile.findOne({ userId: chat.startupUserId }).lean(),
    ProfessionalProfile.findOne({ userId: chat.professionalUserId }).lean(),
    User.findById(chat.startupUserId).select('name').lean(),
  ]);

  return {
    ...chat.toObject(),
    startupName: startupProfile?.companyName ?? 'Startup',
    startupPersonName: startupUser?.name ?? '',
    professionalName: professionalProfile?.fullName ?? 'Professional',
    professionalType: professionalProfile?.professionType ?? 'PROFESSIONAL',
  };
};

export const getMessages = async (
  chatId: string,
  userId: string,
  page = 1,
  limit = 30,
) => {
  const chat = await Chat.findById(chatId);
  if (!chat) throw Object.assign(new Error('Chat not found'), { statusCode: 404 });
  assertParticipant(chat, userId);

  const skip = (page - 1) * limit;
  const [messages, total] = await Promise.all([
    Message.find({ chatId }).sort({ createdAt: 1 }).skip(skip).limit(limit),
    Message.countDocuments({ chatId }),
  ]);
  return { messages, total, page, limit };
};

export const sendMessage = async (
  chatId: string,
  senderId: string,
  text: string,
) => {
  const chat = await Chat.findById(chatId);
  if (!chat) throw Object.assign(new Error('Chat not found'), { statusCode: 404 });
  assertParticipant(chat, senderId);

  return Message.create({ chatId, senderId, text });
};
