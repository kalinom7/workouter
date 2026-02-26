import { type RequestHandler } from 'express';
import { type ZodType } from 'zod';
export type ParsedData<Params, Body, Query> = {
  params: Params;
  body: Body;
  query: Query;
};
export class Validator {
  public validate<Body, Query, Params>(schema: {
    body?: ZodType<Body>;
    query?: ZodType<Query>;
    params?: ZodType<Params>;
  }): RequestHandler<Params, unknown, Body, Query, ParsedData<Params, Body, Query>> {
    return (req, res, next) => {
      console.log('Incoming request:', req.body, req.query, req.params);

      try {
        if (schema.body) {
          res.locals.body = schema.body.parse(req.body);
        }

        if (schema.query) {
          res.locals.query = schema.query.parse(req.query);
        }

        if (schema.params) {
          res.locals.params = schema.params.parse(req.params);
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
