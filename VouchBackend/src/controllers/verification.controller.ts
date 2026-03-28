import { Request, Response, NextFunction } from 'express';
import * as verificationService from '../services/verification.service';
import { sendSuccess } from '../utils/apiResponse';

export const submitDocs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uploadedUrls = (req as Request & { uploadedUrls?: string[] }).uploadedUrls;
    if (!uploadedUrls || uploadedUrls.length === 0) {
      res.status(422).json({ success: false, message: 'No files uploaded' });
      return;
    }
    const result = await verificationService.submitVerification(req.user!.userId, uploadedUrls);
    sendSuccess(res, result, 'Verification submitted', 201);
  } catch (err) {
    next(err);
  }
};
