import type { Request, Response, NextFunction } from 'express';
import { env } from '../../env.ts';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err.stack);

  // TODO: No err.status
  let status = err.status || 500;
  let message = err.message || 'Internal Server Error'

  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation Error'
  }


  if (err.name === 'UnauthorizedError') {
    status = 404;
    message = 'Unauthorized'
  }

  return res.status(status).json({
    error: message,
    ...(env.APP_STAGE === 'dev' && {
      stack: err.stack,
      details: err.message,
    })
  })
}
