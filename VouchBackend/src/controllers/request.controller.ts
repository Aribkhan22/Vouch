import { Request, Response, NextFunction } from 'express';
import * as requestService from '../services/request.service';
import { sendSuccess } from '../utils/apiResponse';
import { ServiceCategory } from '../utils/constants';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await requestService.createRequest(req.user!.userId, req.body as {
      category: ServiceCategory;
      description: string;
      city: string;
      budgetRange: string;
    });
    sendSuccess(res, result, 'Request created', 201);
  } catch (err) {
    next(err);
  }
};

export const mine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await requestService.getMyRequests(req.user!.userId, req.user!.role);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const open = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { city } = req.query as { city?: string };
    const result = await requestService.getOpenRequests(city, req.user!.role);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const accept = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await requestService.acceptRequest(
      req.params.id,
      req.user!.userId,
    );
    sendSuccess(res, result, 'Request accepted');
  } catch (err) {
    next(err);
  }
};

export const close = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await requestService.closeRequest(req.params.id, req.user!.userId);
    sendSuccess(res, result, 'Request closed');
  } catch (err) {
    next(err);
  }
};
