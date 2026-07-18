import { type Workout } from './model/Workout.js';

export abstract class WorkoutRepository {
  public abstract get(workoutId: string, userId: string): Promise<Workout | null>;
  public abstract getAllFinished(userId: string): Promise<Workout[] | null>;
  public abstract save(workout: Workout): Promise<void>;
}
