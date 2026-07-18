import { type WorkoutSchedule } from './model/WorkoutSchedule.js';

export abstract class WorkoutScheduleRepository {
  public abstract save(workoutSchedule: WorkoutSchedule): Promise<void>;
  public abstract get(workoutScheduleId: string, userId: string): Promise<WorkoutSchedule | null>;
  public abstract getAll(userId: string): Promise<WorkoutSchedule[]>;
  public abstract getActive(userId: string): Promise<WorkoutSchedule | null>;
  public abstract delete(workoutScheduleId: string, userId: string): Promise<void>;
}
