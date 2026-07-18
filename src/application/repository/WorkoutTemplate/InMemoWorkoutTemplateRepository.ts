import { injectable } from 'inversify';
import { WorkoutTemplateRepository } from '../../../domain/workouttemplate/WorkoutTemplateRepository.js';
import { WorkoutTemplate } from '../../../domain/workouttemplate/model/WorkoutTemplate.js';
import { WorkoutTemplateExercise } from '../../../domain/workouttemplate/model/WorkoutTemplateExercise.js';

@injectable()
export class InMemoWorkoutTemplateRepository extends WorkoutTemplateRepository {
  private readonly workoutTemplates: Map<string, WorkoutTemplate> = new Map();
  private readonly workoutTemplateExercises: Map<string, WorkoutTemplateExercise[]> = new Map();

  public async save(workoutTemplate: WorkoutTemplate): Promise<void> {
    this.workoutTemplates.set(workoutTemplate.id, workoutTemplate);
    this.workoutTemplateExercises.set(workoutTemplate.id, workoutTemplate.exercises);
  }

  public async saveWorkoutTemplateExercise(
    workoutTemplateId: string,
    _userId: string,
    workoutTemplateExercise: WorkoutTemplateExercise,
  ): Promise<void> {
    const exercises = this.workoutTemplateExercises.get(workoutTemplateId) || [];
    const index = exercises.findIndex((e) => e.order === workoutTemplateExercise.order);

    if (index === -1) {
      throw new Error('WorkoutTemplateExercise not found');
    } else {
      exercises[index] = workoutTemplateExercise;
    }

    this.workoutTemplateExercises.set(workoutTemplateId, exercises);
  }

  public async get(workoutTemplateId: string, userId: string): Promise<WorkoutTemplate | null> {
    const workoutTemplate = this.workoutTemplates.get(workoutTemplateId);
    if (workoutTemplate && workoutTemplate.userId === userId) {
      return workoutTemplate;
    }

    return null;
  }

  public async getAll(userId: string): Promise<WorkoutTemplate[]> {
    const workoutTemplates: WorkoutTemplate[] = [];
    for (const workoutTemplate of this.workoutTemplates.values()) {
      if (workoutTemplate.userId === userId) {
        workoutTemplates.push(workoutTemplate);
      }
    }

    return workoutTemplates;
  }

  public async getByOrder(
    workoutTemplateId: string,
    _userId: string,
    order: number,
  ): Promise<WorkoutTemplateExercise | null> {
    const exercises = this.workoutTemplates.get(workoutTemplateId)?.exercises || [];
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
