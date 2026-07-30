import { DomainException } from '../DomainException.js';

export class WorkoutNotFoundException extends DomainException {
  constructor() {
    super('Workout not found');
    this.name = 'WorkoutNotFoundException';
  }
}
export class ExerciseNotFoundInWorkoutException extends DomainException {
  constructor() {
    super('Exercise not found in Workout');
    this.name = 'ExerciseNotFoundInWorkoutException';
  }
}

export class SetNotFoundInWorkoutExercise extends DomainException {
  constructor() {
    super('Set not found in WorkoutExercise');
    this.name = 'SetNotFoundInWorkoutExercise';
  }
}
