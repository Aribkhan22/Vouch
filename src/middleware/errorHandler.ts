import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { sendError } from '../utils/apiResponse';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  logger.error(err.message, { stack: err.stack });
  const status = (err as Error & { statusCode?: number }).statusCode ?? 500;
  sendError(res, err.message || 'Internal server error', status);
};
