import { randomUUID, type UUID } from 'node:crypto';
import { type WorkoutTemplate } from './model/WorkoutTemplate.js';
import { type WorkoutTemplateExercise } from './model/WorkoutTemplateExercise.js';
import { type WorkoutTemplateRepository } from './WorkoutTemplateRepository.js';

export class WorkoutTemplateService {
  constructor(private readonly workoutTemplateRepository: WorkoutTemplateRepository) {}

  //workoutTemplate creation
  public async createWorkoutTemplate(name: string, userId: UUID): Promise<WorkoutTemplate> {
    const workoutTemplate: WorkoutTemplate = {
      id: randomUUID(),
      name,
      userId,
      exercises: [],
    };

    await this.workoutTemplateRepository.save(workoutTemplate);

    return workoutTemplate;
  }

  //select a workoutTemplateExercise
  public async addWorkoutTemplateExercise(
    exerciseId: UUID,
    workoutTemplateId: UUID,
    userId: UUID,
  ): Promise<WorkoutTemplate> {
    const workoutTemplate = await this.workoutTemplateRepository.get(workoutTemplateId, userId);
    if (workoutTemplate == null) {
      throw new Error('WorkoutTemplate not found');
    }
    const order = workoutTemplate.exercises.length;

    //think about why is there a new exercise no something choosen from some list
    const workoutTemplateExercise: WorkoutTemplateExercise = {
      exercise: exerciseId,
      order,
      sets: 0,
      restPeriod: 0,
    };

    workoutTemplate.exercises.push(workoutTemplateExercise);

    await this.workoutTemplateRepository.save(workoutTemplate);

    return workoutTemplate;
  }
  public async removeWorkoutTemplateExercise(workoutTemplateId: UUID, userId: UUID, order: number): Promise<void> {
    const workoutTemplate = await this.workoutTemplateRepository.get(workoutTemplateId, userId);

    if (workoutTemplate == null) {
      throw new Error('WorkoutTemplate not found');
    }
    const exerciseToRemove = workoutTemplate.exercises.find((e) => e.order === order);
    if (exerciseToRemove == null) {
      throw new Error(`WorkoutTemplateExercise with order ${order} not found`);
    }
    workoutTemplate.exercises = workoutTemplate.exercises.filter((e) => e.order !== order);
    // adjust orders of remaining exercises
    for (const e of workoutTemplate.exercises) {
      if (e.order > order) {
        e.order -= 1;
      }
    }
    await this.workoutTemplateRepository.save(workoutTemplate);
  }

  public async setNumberOfSets(sets: number, workoutTemplateId: UUID, userId: UUID, order: number): Promise<void> {
    const workoutTemplateExercise = await this.workoutTemplateRepository.getByOrder(workoutTemplateId, userId, order);
    if (workoutTemplateExercise == null) {
      throw new Error('WorkoutTemplateExercise not found');
    }
    workoutTemplateExercise.sets = sets;

    await this.workoutTemplateRepository.saveWorkoutTemplateExercise(
      workoutTemplateId,
      userId,
      workoutTemplateExercise,
    );
  }

  public async setRestPeriod(restPeriod: number, workoutTemplateId: UUID, userId: UUID, order: number): Promise<void> {
    const workoutTemplateExercise = await this.workoutTemplateRepository.getByOrder(workoutTemplateId, userId, order);
    if (workoutTemplateExercise == null) {
      throw new Error('WorkoutTemplateExercise not found');
    }
    workoutTemplateExercise.restPeriod = restPeriod;

    await this.workoutTemplateRepository.saveWorkoutTemplateExercise(
      workoutTemplateId,
      userId,
      workoutTemplateExercise,
    );
  }

  public async getWorkoutTemplate(workoutTemplateId: UUID, userId: UUID): Promise<WorkoutTemplate> {
    const returnedTemplate = await this.workoutTemplateRepository.get(workoutTemplateId, userId);
    if (returnedTemplate == null) {
      throw new Error('WorkoutTemplate not found');
    }

    return returnedTemplate;
  }

  //delete
  public async deleteWorkoutTemplate(workoutTemplateId: UUID, userId: UUID): Promise<void> {
    await this.workoutTemplateRepository.delete(workoutTemplateId, userId);
  }
}
