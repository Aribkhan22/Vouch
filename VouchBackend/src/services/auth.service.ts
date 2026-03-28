import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AuthPayload } from '../types/express';

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: 'STARTUP' | 'LAWYER' | 'CA',
): Promise<{ accessToken: string; refreshToken: string; user: object }> => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw Object.assign(new Error('Email already in use'), { statusCode: 409 });
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, role });

  const payload: AuthPayload = { userId: user._id.toString(), role: user.role };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

export const loginUser = async (
  email: string,
  password: string,
): Promise<{ accessToken: string; refreshToken: string; user: object }> => {
  const user = await User.findOne({ email });
  if (!user) {
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  }
  if (user.status === 'SUSPENDED') {
    throw Object.assign(new Error('Account suspended'), { statusCode: 403 });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  }
  const payload: AuthPayload = { userId: user._id.toString(), role: user.role };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

export const refreshTokens = async (
  token: string,
): Promise<{ accessToken: string; refreshToken: string }> => {
  let payload: AuthPayload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
  }
  const user = await User.findById(payload.userId);
  if (!user || user.status === 'SUSPENDED') {
    throw Object.assign(new Error('User not found or suspended'), { statusCode: 401 });
  }
  const newPayload: AuthPayload = { userId: user._id.toString(), role: user.role };
  return {
    accessToken: signAccessToken(newPayload),
    refreshToken: signRefreshToken(newPayload),
  };
};

export const getMe = async (userId: string) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  return user;
};
