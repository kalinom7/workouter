import { type RequestHandler } from 'express';
import { type ZodType } from 'zod';

export class Validator {
  public getValidationMiddleware<T>(schema: ZodType<T>): RequestHandler<unknown, unknown, T> {
    return (req, res, next) => {
      console.log('Incoming request:', req.body);

      const result = schema.safeParse(req.body);

      if (!result.success) {
        console.error('Validation error:', result.error);

        return res.status(400).json({ errors: result.error.flatten().fieldErrors });
      }
      req.body = result.data;

      return next();
    };
  }
}
