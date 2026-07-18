import { type Exercise } from './model/Exercise.js';

export abstract class ExerciseRepository {
  public abstract save(exercise: Exercise): Promise<void>;

  public abstract get(exerciseId: string, userId: string): Promise<Exercise | null>;

  public abstract delete(exerciseId: string, userId: string): Promise<void>;

  public abstract getAll(userId: string): Promise<Exercise[]>;
}
