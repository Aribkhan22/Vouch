import { Request, Response, NextFunction } from 'express';
import * as professionalService from '../services/professional.service';
import { sendSuccess } from '../utils/apiResponse';

export const upsertProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await professionalService.upsertProfessionalProfile(
      req.user!.userId,
      req.body,
    );
    sendSuccess(res, profile, 'Profile saved');
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await professionalService.getProfessionalProfile(req.params.userId);
    sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
};

export const listDirectory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { city, type, specialization, verified, page, limit } = req.query as Record<
      string,
      string
    >;
    const result = await professionalService.listProfessionals({
      city,
      type: type as 'LAWYER' | 'CA' | undefined,
      specialization,
      verified: verified !== 'false',
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(parseInt(limit, 10), 50) : 20,
    });
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};
