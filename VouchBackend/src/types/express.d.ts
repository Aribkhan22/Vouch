import { Request } from 'express';

export interface AuthPayload {
  userId: string;
  role: 'STARTUP' | 'LAWYER' | 'CA' | 'ADMIN';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
