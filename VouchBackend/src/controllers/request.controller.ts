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

export const requestEnd = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await requestService.requestEndService(req.params.id, req.user!.userId);
    const message = result.status === 'CLOSED'
      ? 'Service ended — both parties confirmed.'
      : 'End service request recorded. Waiting for the other party to confirm.';
    sendSuccess(res, result, message);
  } catch (err) {
    next(err);
  }
};

export const reject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }
    const result = await requestService.rejectRequest(req.params.id, req.user!.userId, String(reason).trim());
    sendSuccess(res, result, 'Request rejected');
  } catch (err) {
    next(err);
  }
};

export const getStartupProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await requestService.getStartupProfile(req.params.userId);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};
