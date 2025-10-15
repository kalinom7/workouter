import { ExerciseRepository } from './ExerciseRepository.js';

export class InMemoryExerciseRepository extends ExerciseRepository {
  constructor() {
    super();
    this.exercises = new Map();
  }

  save(exercise) {
    this.exercises.set(exercise.id, exercise);
    return exercise;
  }

  get(exerciseId, userId) {
    return this.exercises.get(exerciseId);
  }
  delete(exerciseId, userId) {
    this.exercises.delete(exerciseId);
  }
}
