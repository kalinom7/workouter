import { injectable } from 'inversify';
import { WorkoutScheduleRepository } from '../../../domain/workoutschedule/WorkoutScheduleRepository.js';
import { WorkoutSchedule } from '../../../domain/workoutschedule/model/WorkoutSchedule.js';

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

  public async getActive(userId: string): Promise<WorkoutSchedule | null> {
    for (const workoutSchedule of this.workoutSchedules.values()) {
      if (workoutSchedule.userId === userId && workoutSchedule.isActive) {
        return workoutSchedule;
      }
    }

    return null;
  }
}
