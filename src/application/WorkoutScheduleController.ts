import { inject, injectable } from 'inversify';
import { TYPES } from '../types.js';
import { WorkoutScheduleService } from '../domain/workoutschedule/WorkoutScheduleService.js';
import { z } from 'zod';
import { type UUID } from 'node:crypto';
import { type Request, type Response } from 'express';

export const createWorkoutScheduleDto = z.object({
  name: z.string().min(1),
  userId: z.uuid().transform((str) => str as UUID),
});
type CreateWorkoutScheduleDto = z.infer<typeof createWorkoutScheduleDto>;

export const getOrDeleteWorkoutScheduleDto = z.object({
  workoutScheduleId: z.uuid().transform((str) => str as UUID),
  userId: z.uuid().transform((str) => str as UUID),
});
type GetOrDeleteWorkoutScheduleDto = z.infer<typeof getOrDeleteWorkoutScheduleDto>;

export const addWorkoutToBlockDto = z.object({
  workoutScheduleId: z.uuid().transform((str) => str as UUID),
  userId: z.uuid().transform((str) => str as UUID),
  workoutTemplateId: z.uuid().transform((str) => str as UUID),
});
type AddWorkoutToBlockDto = z.infer<typeof addWorkoutToBlockDto>;

export const addRestToBlockDto = z.object({
  workoutScheduleId: z.uuid().transform((str) => str as UUID),
  userId: z.uuid().transform((str) => str as UUID),
  restPeriod: z.number().min(1),
});
type AddRestToBlockDto = z.infer<typeof addRestToBlockDto>;

export const removeBlockItemDto = z.object({
  userId: z.uuid().transform((str) => str as UUID),
  workoutScheduleId: z.uuid().transform((str) => str as UUID),
  blockItemId: z.uuid().transform((str) => str as UUID),
});
type RemoveBlockItemDto = z.infer<typeof removeBlockItemDto>;

type SetActiveInactiveDto = z.infer<typeof getOrDeleteWorkoutScheduleDto>;

@injectable()
export class WorkoutScheduleController {
  constructor(
    @inject(TYPES.WorkoutScheduleService)
    private readonly workoutScheduleService: WorkoutScheduleService,
  ) {}

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
