import { ErrorRequestHandler } from 'express';
import { injectable } from 'inversify';
import {
  ExerciseNotFoundInWorkoutException,
  SetNotFoundInWorkoutExercise,
  WorkoutNotFoundException,
} from '../../domain/workout/WorkoutException.js';

@injectable()
export class WorkoutErrorHandler {
  public getErrorHandler(): ErrorRequestHandler<unknown, unknown, unknown, unknown> {
    return (err, _req, _res, next) => {
      if (
        err instanceof WorkoutNotFoundException ||
        err instanceof ExerciseNotFoundInWorkoutException ||
        err instanceof SetNotFoundInWorkoutExercise
      ) {
        return next(err.message);
      }
    };
  }
}
