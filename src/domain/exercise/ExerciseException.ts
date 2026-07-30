import { DomainException } from '../DomainException.js';

export class ExerciseNotFoundException extends DomainException {
  constructor() {
    super('Exercise not found');
    this.name = 'ExerciseNotFoundException';
  }
}
