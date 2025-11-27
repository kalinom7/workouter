import { injectable, inject } from 'inversify';
import { type WorkoutTemplateService } from '../../domain/workouttemplate/WorkoutTemplateService.js';
import { type Request, type Response } from 'express';
import { TYPES } from '../../types.js';
import {
  type CreateWorkoutTemplateDto,
  type AddWorkoutTemplateExerciseDto,
  type RemoveWorkoutTemplateExerciseDto,
  type SetNumberOfSetsDto,
  type SetRestPeriodDto,
  type GetWorkoutTemplateDto,
} from '../dto/WorkoutTemplateControllerDto.js';

@injectable()
export class WorkoutTemplateController {
  constructor(
    @inject(TYPES.WorkoutTemplateService)
    private readonly workoutTemplateService: WorkoutTemplateService,
  ) {}

  public async create(
    request: Request<unknown, unknown, CreateWorkoutTemplateDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { name, userId } = request.body;
    const workoutTemplate = await this.workoutTemplateService.createWorkoutTemplate(name, userId);
    response.status(201).json(workoutTemplate);
  }

  public async addWorkoutTemplateExercise(
    request: Request<unknown, unknown, AddWorkoutTemplateExerciseDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { exerciseId, workoutTemplateId, userId } = request.body;
    const workoutTemplate = await this.workoutTemplateService.addWorkoutTemplateExercise(
      exerciseId,
      workoutTemplateId,
      userId,
    );
    response.status(201).json(workoutTemplate);
  }
  public async removeWorkoutTemplateExercise(
    request: Request<unknown, unknown, RemoveWorkoutTemplateExerciseDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { workoutTemplateId, userId, order } = request.body;
    await this.workoutTemplateService.removeWorkoutTemplateExercise(workoutTemplateId, userId, order);
    const workoutTemplate = await this.workoutTemplateService.getWorkoutTemplate(workoutTemplateId, userId);
    response.status(200).json(workoutTemplate);
  }

  public async setNumberOfSets(
    request: Request<unknown, unknown, SetNumberOfSetsDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { sets, workoutTemplateId, userId, order } = request.body;
    await this.workoutTemplateService.setNumberOfSets(sets, workoutTemplateId, userId, order);
    const workoutTemplate = await this.workoutTemplateService.getWorkoutTemplate(workoutTemplateId, userId);
    response.status(200).json(workoutTemplate);
  }

  public async setRestPeriod(
    request: Request<unknown, unknown, SetRestPeriodDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { restPeriod, workoutTemplateId, userId, order } = request.body;
    await this.workoutTemplateService.setRestPeriod(restPeriod, workoutTemplateId, userId, order);
    const workoutTemplate = await this.workoutTemplateService.getWorkoutTemplate(workoutTemplateId, userId);
    response.status(200).json(workoutTemplate);
  }

  public async getWorkoutTemplate(
    request: Request<unknown, unknown, GetWorkoutTemplateDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { workoutTemplateId, userId } = request.body;
    const workoutTemplate = await this.workoutTemplateService.getWorkoutTemplate(workoutTemplateId, userId);
    response.status(200).json(workoutTemplate);
  }

  public async deleteWorkoutTemplate(
    request: Request<unknown, unknown, GetWorkoutTemplateDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { workoutTemplateId, userId } = request.body;
    await this.workoutTemplateService.deleteWorkoutTemplate(workoutTemplateId, userId);
    response.status(204).send();
  }
}
