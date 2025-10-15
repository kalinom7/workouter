import { type WorkoutTemplate } from './model/WorkoutTemplate.js';

export interface WorkoutTemplateRepository {
  save(workoutTemplate: WorkoutTemplate): Promise<void>;
  get(workoutTemplateId: string, userId: string): Promise<WorkoutTemplate>;
  delete(workoutTemplateId: string, userId: string): Promise<void>;
}
