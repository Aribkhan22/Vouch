import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service';
import { sendSuccess } from '../utils/apiResponse';

export const listVerifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { status } = req.query as { status?: string };
    const result = await adminService.listVerifications(status);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const approveVerification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await adminService.approveVerification(
      req.params.id,
      req.user!.userId,
    );
    sendSuccess(res, result, 'Verification approved');
  } catch (err) {
    next(err);
  }
};

export const rejectVerification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { adminNote } = req.body;
    const result = await adminService.rejectVerification(
      req.params.id,
      req.user!.userId,
      adminNote || '',
    );
    sendSuccess(res, result, 'Verification rejected');
  } catch (err) {
    next(err);
  }
};
