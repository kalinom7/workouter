import { type Exercise } from './model/Exercise.js';

export interface ExerciseRepository {
  save(exercise: Exercise): Promise<void>;

  get(exerciseId: string, userId: string): Promise<Exercise | null>;

  delete(exerciseId: string, userId: string): Promise<void>;
}

export class InMemoExerciseRepository implements ExerciseRepository {
  private exercises: Map<string, Exercise> = new Map();

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
