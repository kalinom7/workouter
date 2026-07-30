import { ErrorRequestHandler } from 'express';
import { injectable } from 'inversify';
import {
  WorkoutScheduleInvalidStateException,
  WorkoutScheduleNotFoundException,
  WorkoutSchedulePatternItemNotFoundException,
  WorkoutScheduleScheduledActivitySkippedException,
} from '../../domain/workoutschedule/WorkoutScheduleExceptions.js';
import { ConflictException, InternalServerErrorException, NotFoundException } from '../HttpException.js';
import { DomainException } from '../../domain/DomainException.js';

@injectable()
export class WorkoutScheduleErrorHandler {
  public getErrorHandler(): ErrorRequestHandler<unknown, unknown, unknown, unknown> {
    return (err, _req, _res, next) => {
      if (err instanceof DomainException) {
        if (
          err instanceof WorkoutScheduleNotFoundException ||
          err instanceof WorkoutSchedulePatternItemNotFoundException
        ) {
          next(new NotFoundException(err.message));
        } else if (err instanceof WorkoutScheduleInvalidStateException) {
          next(new InternalServerErrorException(err.message));
        } else if (err instanceof WorkoutScheduleScheduledActivitySkippedException) {
          next(new ConflictException(err.message));
        } else {
          next(err);
        }
      } else {
        next(err);
      }
    };
  }
}
