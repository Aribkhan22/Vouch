import { Request, Response, NextFunction } from 'express';
import * as chatService from '../services/chat.service';
import { sendSuccess } from '../utils/apiResponse';

export const getChatByRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const chat = await chatService.getChatByRequest(
      req.params.requestId,
      req.user!.userId,
    );
    sendSuccess(res, chat);
  } catch (err) {
    next(err);
  }
};

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;
    const result = await chatService.getMessages(
      req.params.chatId,
      req.user!.userId,
      page,
      limit,
    );
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const msg = await chatService.sendMessage(
      req.params.chatId,
      req.user!.userId,
      req.body.text,
    );
    sendSuccess(res, msg, 'Message sent', 201);
  } catch (err) {
    next(err);
  }
};
