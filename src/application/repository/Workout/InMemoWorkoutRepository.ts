import { injectable } from 'inversify';
import { WorkoutRepository } from '../../../domain/workout/WorkoutRepository.js';
import { Workout } from '../../../domain/workout/model/Workout.js';

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

  public async getAllFinished(userId: string): Promise<Workout[]> {
    const allWorkouts: Workout[] = [];
    for (const workout of this.workouts.values()) {
      if (workout.userId === userId && workout.endTime !== null) {
        allWorkouts.push(workout);
      }
    }

    return allWorkouts;
  }

  public async save(workout: Workout): Promise<void> {
    this.workouts.set(workout.id, workout);
  }
}
