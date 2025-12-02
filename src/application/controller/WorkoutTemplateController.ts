import { type Request, type Response } from 'express';
import { injectable } from 'inversify';
import { WorkoutTemplateService } from '../../domain/workouttemplate/WorkoutTemplateService.js';
import {
  AddWorkoutTemplateExerciseBodyDto,
  AddWorkoutTemplateExerciseParamsDto,
  DeleteWorkoutTemplateParamsDto,
  RemoveWorkoutTemplateExerciseBodyDto,
  RemoveWorkoutTemplateExerciseParamsDto,
  SetNumberOfSetsBodyDto,
  SetNumberOfSetsParamsDto,
  SetRestPeriodBodyDto,
  SetRestPeriodParamsDto,
  CreateWorkoutTemplateBodyDto,
  GetWorkoutTemplateParamsDto,
} from '../dto/WorkoutTemplateControllerDto.js';
import { AuthorizationDto } from '../dto/AuthorizationDto.js';

@injectable()
export class WorkoutTemplateController {
  constructor(private readonly workoutTemplateService: WorkoutTemplateService) {}

  public async create(
    request: Request<unknown, unknown, CreateWorkoutTemplateBodyDto, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { name } = request.body;
    const { userId } = request.query;
    const workoutTemplate = await this.workoutTemplateService.createWorkoutTemplate(name, userId);
    response.status(201).json(workoutTemplate);
  }

  public async addWorkoutTemplateExercise(
    request: Request<AddWorkoutTemplateExerciseParamsDto, unknown, AddWorkoutTemplateExerciseBodyDto, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { exerciseId } = request.body;
    const { userId } = request.query;
    const { workoutTemplateId } = request.params;
    const workoutTemplate = await this.workoutTemplateService.addWorkoutTemplateExercise(
      exerciseId,
      workoutTemplateId,
      userId,
    );
    response.status(201).json(workoutTemplate);
  }
  public async removeWorkoutTemplateExercise(
    request: Request<
      RemoveWorkoutTemplateExerciseParamsDto,
      unknown,
      RemoveWorkoutTemplateExerciseBodyDto,
      AuthorizationDto
    >,
    response: Response,
  ): Promise<void> {
    const { order } = request.body;
    const { userId } = request.query;
    const { workoutTemplateId } = request.params;
    await this.workoutTemplateService.removeWorkoutTemplateExercise(workoutTemplateId, userId, order);
    const workoutTemplate = await this.workoutTemplateService.getWorkoutTemplate(workoutTemplateId, userId);
    response.status(200).json(workoutTemplate);
  }

  public async setNumberOfSets(
    request: Request<SetNumberOfSetsParamsDto, unknown, SetNumberOfSetsBodyDto, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { sets } = request.body;
    const { workoutTemplateId, order } = request.params;
    const { userId } = request.query;
    await this.workoutTemplateService.setNumberOfSets(sets, workoutTemplateId, userId, order);
    const workoutTemplate = await this.workoutTemplateService.getWorkoutTemplate(workoutTemplateId, userId);
    response.status(200).json(workoutTemplate);
  }

  public async setRestPeriod(
    request: Request<SetRestPeriodParamsDto, unknown, SetRestPeriodBodyDto, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { restPeriod } = request.body;
    const { workoutTemplateId, order } = request.params;
    const { userId } = request.query;
    await this.workoutTemplateService.setRestPeriod(restPeriod, workoutTemplateId, userId, order);
    const workoutTemplate = await this.workoutTemplateService.getWorkoutTemplate(workoutTemplateId, userId);
    response.status(200).json(workoutTemplate);
  }

  public async getWorkoutTemplate(
    request: Request<GetWorkoutTemplateParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { workoutTemplateId } = request.params;
    const { userId } = request.query;
    const workoutTemplate = await this.workoutTemplateService.getWorkoutTemplate(workoutTemplateId, userId);
    response.status(200).json(workoutTemplate);
  }

  public async deleteWorkoutTemplate(
    request: Request<DeleteWorkoutTemplateParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { workoutTemplateId } = request.params;
    const { userId } = request.query;
    await this.workoutTemplateService.deleteWorkoutTemplate(workoutTemplateId, userId);
    response.status(204).send();
  }
}
