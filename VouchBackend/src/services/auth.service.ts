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
    throw Object.assign(new Error('This email is already registered. Please try logging in or use a different email.'), { statusCode: 409 });
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
    throw Object.assign(new Error('Email or username is incorrect'), { statusCode: 401 });
  }
  if (user.status === 'SUSPENDED') {
    throw Object.assign(new Error('Account suspended'), { statusCode: 403 });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw Object.assign(new Error('Password is incorrect'), { statusCode: 401 });
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
    throw Object.assign(new Error('Your session has expired. Please log in again.'), { statusCode: 401 });
  }
  const user = await User.findById(payload.userId);
  if (!user) {
    throw Object.assign(new Error('User account no longer exists. Please register a new account.'), { statusCode: 401 });
  }
  if (user.status === 'SUSPENDED') {
    throw Object.assign(new Error('Your account has been suspended. Please contact support.'), { statusCode: 403 });
  }
  const newPayload: AuthPayload = { userId: user._id.toString(), role: user.role };
  return {
    accessToken: signAccessToken(newPayload),
    refreshToken: signRefreshToken(newPayload),
  };
};

export const getMe = async (userId: string) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) throw Object.assign(new Error('User account not found. Please log in again.'), { statusCode: 404 });
  return user;
};
