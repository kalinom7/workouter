import { type Request, type Response } from 'express';
import { injectable } from 'inversify';
import { WorkoutScheduleService } from '../../domain/workoutschedule/WorkoutScheduleService.js';
import {
  AddRestToBlockBodyDto,
  AddRestToBlockParamsDto,
  AddWorkoutToBlockBodyDto,
  AddWorkoutToBlockParamsDto,
  CreateWorkoutScheduleBodyDto,
  DeleteWorkoutScheduleParamsDto,
  GetWorkoutScheduleParamsDto,
  RemoveBlockItemBodyDto,
  RemoveBlockItemParamsDto,
  SetWorkoutScheduleActiveParamsDto,
  SetWorkoutScheduleInactiveParamsDto,
} from '../dto/WorkoutScheduleControllerDto.js';
import { AuthorizationDto } from '../dto/AuthorizationDto.js';

@injectable()
export class WorkoutScheduleController {
  constructor(private readonly workoutScheduleService: WorkoutScheduleService) {}

  public async createWorkoutSchedule(
    request: Request<unknown, unknown, CreateWorkoutScheduleBodyDto, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { name } = request.body;
    const { userId } = request.query;

    const WorkoutSchedule = await this.workoutScheduleService.create(name, userId);
    response.status(201).json(WorkoutSchedule);
  }

  public async getWorkoutSchedule(
    request: Request<GetWorkoutScheduleParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { workoutScheduleId } = request.params;
    const { userId } = request.query;
    const workoutSchedule = await this.workoutScheduleService.get(workoutScheduleId, userId);
    response.status(200).json(workoutSchedule);
  }

  public async deleteWorkoutSchedule(
    request: Request<DeleteWorkoutScheduleParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { workoutScheduleId } = request.params;
    const { userId } = request.query;
    await this.workoutScheduleService.delete(workoutScheduleId, userId);
    response.status(204).send();
  }

  public async addWorkoutToBlock(
    request: Request<AddWorkoutToBlockParamsDto, unknown, AddWorkoutToBlockBodyDto, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { workoutTemplateId } = request.body;
    const { userId } = request.query;
    const { workoutScheduleId } = request.params;
    const workoutSchedule = await this.workoutScheduleService.addWorkoutToBlock(
      workoutTemplateId,
      userId,
      workoutScheduleId,
    );
    response.status(201).json(workoutSchedule);
  }

  public async addRestToBlock(
    request: Request<AddRestToBlockParamsDto, unknown, AddRestToBlockBodyDto, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { restPeriod } = request.body;
    const { userId } = request.query;
    const { workoutScheduleId } = request.params;
    const workoutSchedule = await this.workoutScheduleService.addRestToBlock(restPeriod, userId, workoutScheduleId);
    response.status(201).json(workoutSchedule);
  }

  public async removeBlockItem(
    request: Request<RemoveBlockItemParamsDto, unknown, RemoveBlockItemBodyDto, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { blockItemId } = request.body;
    const { userId } = request.query;
    const { workoutScheduleId } = request.params;
    const workoutSchedule = await this.workoutScheduleService.removeBlockItem(userId, workoutScheduleId, blockItemId);
    response.status(200).json(workoutSchedule);
  }
  public async setWorkoutScheduleActive(
    request: Request<SetWorkoutScheduleActiveParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { workoutScheduleId } = request.params;
    const { userId } = request.query;
    const workoutSchedule = await this.workoutScheduleService.setActive(workoutScheduleId, userId);
    response.status(200).json(workoutSchedule);
  }
  public async setWorkoutScheduleInActive(
    request: Request<SetWorkoutScheduleInactiveParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { workoutScheduleId } = request.params;
    const { userId } = request.query;
    const workoutSchedule = await this.workoutScheduleService.setInactive(workoutScheduleId, userId);
    response.status(200).json(workoutSchedule);
  }
}
