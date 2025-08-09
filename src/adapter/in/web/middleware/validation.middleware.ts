import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import DomainError from '../../../shared/errors/domain-error';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
      const message = parseResult.error.issues.map(i => i.message).join(', ');
      return next(new DomainError(message));
    }
    req.body = parseResult.data as unknown as T; // validated
    next();
  };
}
