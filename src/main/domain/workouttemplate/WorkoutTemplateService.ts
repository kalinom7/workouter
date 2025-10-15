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
    name: string,
    workoutTemplateId: UUID,
    userId: UUID,
  ): Promise<WorkoutTemplate> {
    const workoutTemplate = await this.workoutTemplateRepository.get(workoutTemplateId, userId);

    const order = workoutTemplate.exercises.length;

    //think about why is there a new exercise no something choosen from some list
    const workoutTemplateExercise: WorkoutTemplateExercise = {
      exercise: {
        name,
      },
      order,
      sets: 0,
      restPeriod: 0,
    };

    workoutTemplate.exercises.push(workoutTemplateExercise);

    await this.workoutTemplateRepository.save(workoutTemplate);

    return workoutTemplate;
  }

  //analyze if it makes sense
  public async setNumberOfSets(
    sets: number,
    workoutTemplateId: UUID,
    userId: UUID,
    order: number,
  ): Promise<WorkoutTemplate> {
    const workoutTemplate = await this.workoutTemplateRepository.get(workoutTemplateId, userId);
    const workoutTemplateExercise = workoutTemplate.exercises.find((ex) => ex.order === order);
    if (!workoutTemplateExercise) {
      throw new Error('Exercise not found');
    }
    workoutTemplateExercise.sets = sets;

    await this.workoutTemplateRepository.save(workoutTemplate);

    return workoutTemplate;
  }

  public async getWorkoutTemplate(workoutTemplateId: UUID, userId: UUID): Promise<WorkoutTemplate> {
    return this.workoutTemplateRepository.get(workoutTemplateId, userId);
  }

  //delete
  public async deleteWorkoutTemplate(workoutTemplateId: UUID, userId: UUID): Promise<void> {
    await this.workoutTemplateRepository.delete(workoutTemplateId, userId);
  }
}
