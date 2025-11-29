import { type Exercise } from './model/Exercise.js';
import { injectable } from 'inversify';
export abstract class ExerciseRepository {
  public abstract save(exercise: Exercise): Promise<void>;

  public abstract get(exerciseId: string, userId: string): Promise<Exercise | null>;

  public abstract delete(exerciseId: string, userId: string): Promise<void>;
}

@injectable()
export class InMemoExerciseRepository extends ExerciseRepository {
  private readonly exercises: Map<string, Exercise> = new Map();

  public async save(exercise: Exercise): Promise<void> {
    this.exercises.set(exercise.id, exercise);
  }

  public async get(exerciseId: string, userId: string): Promise<Exercise | null> {
    const exercise = this.exercises.get(exerciseId);
    if (exercise && exercise.userId === userId) {
      return exercise;
    }

    return null;
  }

  public async delete(exerciseId: string, userId: string): Promise<void> {
    const exercise = this.exercises.get(exerciseId);
    if (exercise && exercise.userId === userId) {
      this.exercises.delete(exerciseId);
    }
  }
}
