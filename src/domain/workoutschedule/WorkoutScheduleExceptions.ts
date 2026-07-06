export class DomainException extends Error {
  constructor(description: string) {
    super(description);
    this.name = 'DomainException';
  }
}
export class WorkoutScheduleNotFoundException extends DomainException {
  constructor() {
    super('Workout schedule not found');
    this.name = 'WorkoutScheduleNotFoundException';
  }
}
export class WorkoutScheduleInvalidStateException extends DomainException {
  constructor(description: string) {
    super(description);
    this.name = 'WorkoutScheduleInvalidStateException';
  }
}
export class WorkoutScheduleScheduledActivitySkippedException extends DomainException {
  constructor(description: string) {
    super(description);
    this.name = 'WorkoutScheduleScheduledActivitySkippedException';
  }
}
