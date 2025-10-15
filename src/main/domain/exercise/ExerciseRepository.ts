import { type Exercise } from './model/Exercise.js';

export interface ExerciseRepository {
  save(exercise: Exercise): void;

  get(exerciseId: string, userId: string): Exercise;

  delete(exerciseId: string, userId: string): void;
}
