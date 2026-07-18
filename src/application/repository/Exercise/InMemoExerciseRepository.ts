import { injectable } from 'inversify';
import { ExerciseRepository } from '../../../domain/exercise/ExerciseRepository.js';
import { Exercise } from '../../../domain/exercise/model/Exercise.js';

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

  public async getAll(userId: string): Promise<Exercise[]> {
    const exercises: Exercise[] = [];
    for (const exercise of this.exercises.values()) {
      if (exercise.userId === userId) {
        exercises.push(exercise);
      }
    }

    return exercises;
  }

  public async delete(exerciseId: string, userId: string): Promise<void> {
    const exercise = this.exercises.get(exerciseId);
    if (exercise && exercise.userId === userId) {
      this.exercises.delete(exerciseId);
    }
  }
}
