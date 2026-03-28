import { Request, Response, NextFunction, RequestHandler } from 'express';
import { sendError } from '../utils/apiResponse';
import { Role } from '../utils/constants';

export const authorize = (...roles: Role[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }
    if (!roles.includes(req.user.role as Role)) {
      sendError(res, 'Forbidden: insufficient role', 403);
      return;
    }
    next();
  };
};
