import { injectable } from 'inversify';
import { type WorkoutSchedule } from './model/WorkoutSchedule.js';

export interface WorkoutScheduleRepository {
  save(workoutSchedule: WorkoutSchedule): Promise<void>;
  get(workoutScheduleId: string, userId: string): Promise<WorkoutSchedule | null>;
  delete(workoutScheduleId: string, userId: string): Promise<void>;
}

@injectable()
export class InMemoWorkoutScheduleRepository implements WorkoutScheduleRepository {
  private readonly workoutSchedules: Map<string, WorkoutSchedule> = new Map();

  public async save(workoutSchedule: WorkoutSchedule): Promise<void> {
    this.workoutSchedules.set(workoutSchedule.id, workoutSchedule);
  }

  public async get(workoutScheduleId: string, userId: string): Promise<WorkoutSchedule | null> {
    const workoutSchedule = this.workoutSchedules.get(workoutScheduleId);
    if (workoutSchedule && workoutSchedule.userId === userId) {
      return workoutSchedule;
    }

    return null;
  }

  public async delete(workoutScheduleId: string, userId: string): Promise<void> {
    const workoutSchedule = this.workoutSchedules.get(workoutScheduleId);
    if (workoutSchedule && workoutSchedule.userId === userId) {
      this.workoutSchedules.delete(workoutScheduleId);
    }
  }
}
