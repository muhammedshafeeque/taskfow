import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

type ValidateSource = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, source: ValidateSource = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const data = req[source];
    const result = schema.safeParse(data);

    if (result.success) {
      req[source] = result.data;
      next();
      return;
    }

    const error = result.error as ZodError;
    const message = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    next(new ApiError(400, message));
  };
}
