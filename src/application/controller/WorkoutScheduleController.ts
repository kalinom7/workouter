import { type Request, type Response } from 'express';
import { injectable } from 'inversify';
import { WorkoutScheduleService } from '../../domain/workoutschedule/WorkoutScheduleService.js';
import {
  type AddRestToBlockDto,
  type AddWorkoutToBlockDto,
  type CreateWorkoutScheduleDto,
  type GetOrDeleteWorkoutScheduleDto,
  type RemoveBlockItemDto,
  type SetActiveInactiveDto,
} from '../dto/WorkoutScheduleControllerDto.js';

@injectable()
export class WorkoutScheduleController {
  constructor(private readonly workoutScheduleService: WorkoutScheduleService) {}

  public async createWorkoutSchedule(
    request: Request<unknown, unknown, CreateWorkoutScheduleDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { name, userId } = request.body;
    const WorkoutSchedule = await this.workoutScheduleService.create(name, userId);
    response.status(201).json(WorkoutSchedule);
  }

  public async getWorkoutSchedule(
    request: Request<unknown, unknown, unknown, GetOrDeleteWorkoutScheduleDto>,
    response: Response,
  ): Promise<void> {
    const { workoutScheduleId, userId } = request.query;
    const workoutSchedule = await this.workoutScheduleService.get(workoutScheduleId, userId);
    response.status(200).json(workoutSchedule);
  }

  public async deleteWorkoutSchedule(
    request: Request<unknown, unknown, unknown, GetOrDeleteWorkoutScheduleDto>,
    response: Response,
  ): Promise<void> {
    const { workoutScheduleId, userId } = request.query;
    await this.workoutScheduleService.delete(workoutScheduleId, userId);
    response.status(204).send();
  }

  public async addWorkoutToBlock(
    request: Request<unknown, unknown, AddWorkoutToBlockDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { workoutTemplateId, userId, workoutScheduleId } = request.body;
    const workoutSchedule = await this.workoutScheduleService.addWorkoutToBlock(
      workoutTemplateId,
      userId,
      workoutScheduleId,
    );
    response.status(200).json(workoutSchedule);
  }

  public async addRestToBlock(
    request: Request<unknown, unknown, AddRestToBlockDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { restPeriod, userId, workoutScheduleId } = request.body;
    const workoutSchedule = await this.workoutScheduleService.addRestToBlock(restPeriod, userId, workoutScheduleId);
    response.status(200).json(workoutSchedule);
  }

  public async removeBlockItem(
    request: Request<unknown, unknown, RemoveBlockItemDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { userId, workoutScheduleId, blockItemId } = request.body;
    const workoutSchedule = await this.workoutScheduleService.removeBlockItem(userId, workoutScheduleId, blockItemId);
    response.status(200).json(workoutSchedule);
  }
  public async setWorkoutScheduleActive(
    request: Request<unknown, unknown, SetActiveInactiveDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { workoutScheduleId, userId } = request.body;
    const workoutSchedule = await this.workoutScheduleService.setActive(workoutScheduleId, userId);
    response.status(200).json(workoutSchedule);
  }
  public async setWorkoutScheduleInActive(
    request: Request<unknown, unknown, SetActiveInactiveDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { workoutScheduleId, userId } = request.body;
    const workoutSchedule = await this.workoutScheduleService.setInactive(workoutScheduleId, userId);
    response.status(200).json(workoutSchedule);
  }
}
