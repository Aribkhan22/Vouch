import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthPayload } from '../types/express';

export const signAccessToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES,
  } as SignOptions);
};

export const signRefreshToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES,
  } as SignOptions);
};

export const verifyAccessToken = (token: string): AuthPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;
};

export const verifyRefreshToken = (token: string): AuthPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as AuthPayload;
};
