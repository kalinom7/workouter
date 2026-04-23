import { injectable } from 'inversify';
import { type WorkoutSchedule } from './model/WorkoutSchedule.js';

export abstract class WorkoutScheduleRepository {
  public abstract save(workoutSchedule: WorkoutSchedule): Promise<void>;
  public abstract get(workoutScheduleId: string, userId: string): Promise<WorkoutSchedule | null>;
  public abstract getAll(userId: string): Promise<WorkoutSchedule[]>;
  public abstract delete(workoutScheduleId: string, userId: string): Promise<void>;
}

@injectable()
export class InMemoWorkoutScheduleRepository extends WorkoutScheduleRepository {
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

  public async getAll(userId: string): Promise<WorkoutSchedule[]> {
    const workoutSchedules: WorkoutSchedule[] = [];
    for (const workoutSchedule of this.workoutSchedules.values()) {
      if (workoutSchedule.userId === userId) {
        workoutSchedules.push(workoutSchedule);
      }
    }

    return workoutSchedules;
  }

  public async delete(workoutScheduleId: string, userId: string): Promise<void> {
    const workoutSchedule = this.workoutSchedules.get(workoutScheduleId);
    if (workoutSchedule && workoutSchedule.userId === userId) {
      this.workoutSchedules.delete(workoutScheduleId);
    }
  }
}
