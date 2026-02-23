import { type RequestHandler } from 'express';
import { type ZodType } from 'zod';

export class Validator {
  public validate<Body extends object, Query extends object, Params extends object>(schema: {
    body?: ZodType<Body>;
    query?: ZodType<Query>;
    params?: ZodType<Params>;
  }): RequestHandler<Params, unknown, Body, Query> {
    return (req, res, next) => {
      console.log('Incoming request:', req.body, req.query, req.params);

      try {
        if (schema.body) {
          Object.assign(req.body, schema.body.parse(req.body));
        }

        if (schema.query) {
          Object.assign(req.query, schema.query.parse(req.query));
        }

        if (schema.params) {
          Object.assign(req.params, schema.params.parse(req.params));
        }
      } catch (error) {
        console.error('Validation error:', error);

        return res.status(400).json({
          error: 'Validation failed',
          details: error,
        });
      }

      return next();
    };
  }
}
