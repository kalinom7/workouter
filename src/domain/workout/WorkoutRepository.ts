import { type Workout } from './model/Workout.js';

export interface WorkoutRepository {
  get(workoutId: string, userId: string): Promise<Workout>;
  save(workout: Workout): Promise<void>;
}
