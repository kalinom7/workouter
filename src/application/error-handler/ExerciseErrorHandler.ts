import { ErrorRequestHandler } from 'express';
import { injectable } from 'inversify';
import { ExerciseNotFoundException } from '../../domain/exercise/ExerciseException.js';
import { NotFoundException } from '../HttpException.js';

@injectable()
export class ExerciseErrorHandler {
  public getErrorHandler(): ErrorRequestHandler<unknown, unknown, unknown, unknown> {
    return (err, _req, _res, next) => {
      if (err instanceof ExerciseNotFoundException) {
        next(new NotFoundException(err.message));
      } else {
        next(err);
      }
    };
  }
}
