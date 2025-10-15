import { type Exercise } from './model/Exercise.js';

export interface ExerciseRepository {
  save(exercise: Exercise): Promise<void>;

  get(exerciseId: string, userId: string): Promise<Exercise>;

  delete(exerciseId: string, userId: string): Promise<void>;
}
