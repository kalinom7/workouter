import { type WorkoutTemplate } from './model/WorkoutTemplate.js';
import { type WorkoutTemplateExercise } from './model/WorkoutTemplateExercise.js';

export interface WorkoutTemplateRepository {
  save(workoutTemplate: WorkoutTemplate): Promise<void>;
  saveWorkoutTemplateExercise(
    workoutTemplateId: string,
    userId: string,
    workoutTemplateExercise: WorkoutTemplateExercise,
  ): Promise<void>;
  get(workoutTemplateId: string, userId: string): Promise<WorkoutTemplate | null>;
  getByOrder(workoutTemplateId: string, userId: string, order: number): Promise<WorkoutTemplateExercise | null>;
  delete(workoutTemplateId: string, userId: string): Promise<void>;
  removeWorkoutTemplateExercise(workoutTemplateId: string, userId: string, order: number): Promise<void>;
}
