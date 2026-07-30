import { ErrorRequestHandler } from 'express';
import { injectable } from 'inversify';
import {
  WorkoutTemplateExerciseNotFoundException,
  WorkoutTemplateNotFoundException,
} from '../../domain/workouttemplate/WorkoutTemplateException.js';
import { NotFoundException } from '../HttpException.js';

@injectable()
export class WorkoutTemplateErrorHandler {
  public getErrorHandler(): ErrorRequestHandler<unknown, unknown, unknown, unknown> {
    return (err, _req, _res, next) => {
      if (err instanceof WorkoutTemplateNotFoundException || err instanceof WorkoutTemplateExerciseNotFoundException) {
        next(new NotFoundException(err.message));
      } else {
        next(err);
      }
    };
  }
}
