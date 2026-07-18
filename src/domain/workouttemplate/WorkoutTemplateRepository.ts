import { type WorkoutTemplate } from './model/WorkoutTemplate.js';
import { type WorkoutTemplateExercise } from './model/WorkoutTemplateExercise.js';

export abstract class WorkoutTemplateRepository {
  public abstract save(workoutTemplate: WorkoutTemplate): Promise<void>;
  public abstract saveWorkoutTemplateExercise(
    workoutTemplateId: string,
    userId: string,
    workoutTemplateExercise: WorkoutTemplateExercise,
  ): Promise<void>;
  public abstract get(workoutTemplateId: string, userId: string): Promise<WorkoutTemplate | null>;
  public abstract getAll(userId: string): Promise<WorkoutTemplate[]>;
  public abstract getByOrder(
    workoutTemplateId: string,
    userId: string,
    order: number,
  ): Promise<WorkoutTemplateExercise | null>;
  public abstract delete(workoutTemplateId: string, userId: string): Promise<void>;
  public abstract removeWorkoutTemplateExercise(
    workoutTemplateId: string,
    userId: string,
    order: number,
  ): Promise<void>;
}
