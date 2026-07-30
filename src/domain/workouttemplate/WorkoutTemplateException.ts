import { DomainException } from '../DomainException.js';

export class WorkoutTemplateNotFoundException extends DomainException {
  constructor() {
    super('Workout template not found');
    this.name = 'WorkoutTemplateNotFoundException';
  }
}

export class WorkoutTemplateExerciseNotFoundException extends DomainException {
  constructor() {
    super('WorkoutTemplateExercise not found');
    this.name = 'WorkoutTemplateExerciseNotFoundException';
  }
}
