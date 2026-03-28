import { Response } from 'express';

interface ApiResponseShape<T> {
  success: boolean;
  message: string;
  data?: T;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
): Response => {
  const body: ApiResponseShape<T> = { success: true, message, data };
  return res.status(statusCode).json(body);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: unknown,
): Response => {
  const body: ApiResponseShape<null> = { success: false, message };
  if (errors !== undefined) (body as unknown as Record<string, unknown>).errors = errors;
  return res.status(statusCode).json(body);
};
