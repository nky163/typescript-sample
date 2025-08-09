import { NextFunction, Request, Response } from 'express';
import logger from '../../logging/logger';
import DomainError from '../../../shared/errors/domain-error';
import { NotFoundError } from '../../../shared/errors/not-found.error';

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const message = err instanceof Error ? err.message : 'Unknown error';
  let status = 500;
  if (err instanceof NotFoundError) status = 404;
  else if (err instanceof DomainError) status = 422;
  logger.error('Unhandled error', { status, message });
  res.status(status).json({ message });
}
