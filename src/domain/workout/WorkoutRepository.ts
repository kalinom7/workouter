import { injectable } from 'inversify';
import { type Workout } from './model/Workout.js';

export abstract class WorkoutRepository {
  public abstract get(workoutId: string, userId: string): Promise<Workout | null>;
  public abstract getAll(userId: string): Promise<Workout[] | null>;

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

  public async getAll(userId: string): Promise<Workout[]> {
    const allWorkouts: Workout[] = [];
    for (const workout of this.workouts.values()) {
      if (workout.userId === userId) {
        allWorkouts.push(workout);
      }
    }

    return allWorkouts;
  }

  public async save(workout: Workout): Promise<void> {
    this.workouts.set(workout.id, workout);
  }
}
