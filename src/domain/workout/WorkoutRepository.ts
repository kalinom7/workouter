import { injectable } from 'inversify';
import { type Workout } from './model/Workout.js';
import { UUID } from 'node:crypto';

export abstract class WorkoutRepository {
  public abstract get(workoutId: string, userId: string): Promise<Workout | null>;
  public abstract getAllFinished(userId: string): Promise<Workout[] | null>;
  public abstract findLastFinishedFromTemplate(
    userId: string,
    workoutTemplateIds: UUID[],
    scheduleStartDate: Date,
  ): Promise<UUID | null>;

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

  /**
   * Returns the most recently completed workout for the given user
   * that matches any of the provided workout template IDs.
   *
   * Used to determine the correct order in WorkoutSchedule.
   */
  public async findLastFinishedFromTemplate(
    userId: UUID,
    workoutTemplateIds: UUID[],
    scheduleStartDate: Date,
  ): Promise<UUID | null> {
    let lastFinishedWorkout: Workout | null = null;

    for (const workout of this.workouts.values()) {
      if (workout.userId !== userId) continue;

      if (!workout.endTime || workout.endTime < scheduleStartDate) continue;

      if (workout.usedWorkoutTemplate !== null && !workoutTemplateIds.includes(workout.usedWorkoutTemplate)) continue;

      if (!lastFinishedWorkout || workout.endTime > lastFinishedWorkout.endTime!) {
        lastFinishedWorkout = workout;
      }
    }

    return lastFinishedWorkout?.usedWorkoutTemplate ?? null;
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
