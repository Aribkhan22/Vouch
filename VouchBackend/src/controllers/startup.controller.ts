import { Request, Response, NextFunction } from 'express';
import * as startupService from '../services/startup.service';
import { sendSuccess } from '../utils/apiResponse';

export const upsertProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await startupService.upsertStartupProfile(req.user!.userId, req.body);
    sendSuccess(res, profile, 'Profile saved');
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await startupService.getStartupProfile(req.params.userId);
    sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
};
