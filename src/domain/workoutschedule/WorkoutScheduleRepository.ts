import { type WorkoutSchedule } from './model/WorkoutSchedule.js';

export interface WorkoutScheduleRepository {
  save(workoutSchedule: WorkoutSchedule): Promise<void>;
  get(workoutScheduleId: string, userId: string): Promise<WorkoutSchedule | null>;
  delete(workoutScheduleId: string, userId: string): Promise<void>;
}
