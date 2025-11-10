import { injectable } from 'inversify';
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
@injectable()
export class InMemoWorkoutTemplateRepository implements WorkoutTemplateRepository {
  private readonly workoutTemplates: Map<string, WorkoutTemplate> = new Map();
  private readonly workoutTemplateExercises: Map<string, WorkoutTemplateExercise[]> = new Map();
  public async save(workoutTemplate: WorkoutTemplate): Promise<void> {
    this.workoutTemplates.set(workoutTemplate.id, workoutTemplate);
  }

  public async saveWorkoutTemplateExercise(
    workoutTemplateId: string,
    _userId: string,
    workoutTemplateExercise: WorkoutTemplateExercise,
  ): Promise<void> {
    const exercises = this.workoutTemplateExercises.get(workoutTemplateId) || [];
    exercises.push(workoutTemplateExercise);
    this.workoutTemplateExercises.set(workoutTemplateId, exercises);
  }
  public async get(workoutTemplateId: string, userId: string): Promise<WorkoutTemplate | null> {
    const workoutTemplate = this.workoutTemplates.get(workoutTemplateId);
    if (workoutTemplate && workoutTemplate.userId === userId) {
      return workoutTemplate;
    }

    return null;
  }

  public async getByOrder(
    workoutTemplateId: string,
    _userId: string,
    order: number,
  ): Promise<WorkoutTemplateExercise | null> {
    const exercises = this.workoutTemplateExercises.get(workoutTemplateId) || [];
    const exercise = exercises.find((ex) => ex.order === order);
    if (exercise) {
      return exercise;
    }

    return null;
  }

  public async delete(workoutTemplateId: string, userId: string): Promise<void> {
    const workoutTemplate = this.workoutTemplates.get(workoutTemplateId);
    if (workoutTemplate && workoutTemplate.userId === userId) {
      this.workoutTemplates.delete(workoutTemplateId);
      this.workoutTemplateExercises.delete(workoutTemplateId);
    }
  }

  public async removeWorkoutTemplateExercise(workoutTemplateId: string, _userId: string, order: number): Promise<void> {
    const exercises = this.workoutTemplateExercises.get(workoutTemplateId) || [];
    const filteredExercises = exercises.filter((ex) => ex.order !== order);
    this.workoutTemplateExercises.set(workoutTemplateId, filteredExercises);
  }
}
