import { DomainException } from '../DomainException.js';

export class WorkoutScheduleNotFoundException extends DomainException {
  constructor() {
    super('Workout schedule not found');
    this.name = 'WorkoutScheduleNotFoundException';
  }
}
export class WorkoutScheduleInvalidStateException extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'WorkoutScheduleInvalidStateException';
  }
}
export class WorkoutScheduleScheduledActivitySkippedException extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'WorkoutScheduleScheduledActivitySkippedException';
  }
}

export class WorkoutSchedulePatternItemNotFoundException extends DomainException {
  constructor() {
    super('Workout schedule pattern item not found');
    this.name = 'WorkoutSchedulePatternItemNotFoundException';
  }
}
