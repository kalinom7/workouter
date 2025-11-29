import { injectable } from 'inversify';
import { type Workout } from './model/Workout.js';

export abstract class WorkoutRepository {
  public abstract get(workoutId: string, userId: string): Promise<Workout | null>;
  public abstract save(workout: Workout): Promise<void>;
}

@injectable()
export class InMemoWorkoutRepository extends WorkoutRepository {
  private readonly workouts: Map<string, Workout> = new Map();

  public async get(workoutId: string, userId: string): Promise<Workout | null> {
    const workout = this.workouts.get(workoutId);
    if (workout && workout.userId === userId) {
      return workout;
    }

    return null;
  }

  public async save(workout: Workout): Promise<void> {
    this.workouts.set(workout.id, workout);
  }
}
