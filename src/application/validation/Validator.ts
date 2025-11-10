import { type RequestHandler } from 'express';
import { z, type ZodType } from 'zod';

export class Validator {
  public getValidationMiddleware<T>(schema: ZodType<T>): RequestHandler<unknown, unknown, T> {
    return (req, res, next) => {
      console.log('Incoming request:', req.body);

      const result = schema.safeParse(req.body);

      if (!result.success) {
        console.error('Validation error:', result.error);

        return res.status(400).json({ errors: z.treeifyError(result.error) });
      }
      req.body = result.data;

      return next();
    };
  }
}
