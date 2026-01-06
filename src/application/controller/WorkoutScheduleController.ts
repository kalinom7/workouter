import { Router, type Request, type Response } from 'express';
import { injectable } from 'inversify';
import { WorkoutScheduleService } from '../../domain/workoutschedule/WorkoutScheduleService.js';
import {
  addRestToBlockBodyDto,
  AddRestToBlockBodyDto,
  addRestToBlockParamsDto,
  AddRestToBlockParamsDto,
  addWorkoutToBlockBodyDto,
  AddWorkoutToBlockBodyDto,
  addWorkoutToBlockParamsDto,
  AddWorkoutToBlockParamsDto,
  createWorkoutScheduleBodyDto,
  CreateWorkoutScheduleBodyDto,
  deleteWorkoutScheduleParamsDto,
  DeleteWorkoutScheduleParamsDto,
  getWorkoutScheduleParamsDto,
  GetWorkoutScheduleParamsDto,
  removeBlockItemParamsDto,
  RemoveBlockItemParamsDto,
  setWorkoutScheduleActiveParamsDto,
  SetWorkoutScheduleActiveParamsDto,
  setWorkoutScheduleInactiveParamsDto,
  SetWorkoutScheduleInactiveParamsDto,
} from '../dto/WorkoutScheduleControllerDto.js';
import { authorizationDto, AuthorizationDto } from '../dto/AuthorizationDto.js';
import { Controller } from './Controller.js';
import { Validator } from '../validation/Validator.js';

@injectable()
export class WorkoutScheduleController extends Controller {
  constructor(
    private readonly workoutScheduleService: WorkoutScheduleService,
    private readonly validator: Validator,
  ) {
    super();
  }
  public getRoutes(): Router {
    const router = Router();
    router.post(
      '/workout-schedules',
      this.validator.validate({ body: createWorkoutScheduleBodyDto, query: authorizationDto }),
      (req, res) => this.createWorkoutSchedule(req, res),
    );

    router.get(
      '/workout-schedules/:workoutScheduleId',
      this.validator.validate({ params: getWorkoutScheduleParamsDto, query: authorizationDto }),
      (req, res) => this.getWorkoutSchedule(req, res),
    );

    router.delete(
      '/workout-schedules/:workoutScheduleId',
      this.validator.validate({ params: deleteWorkoutScheduleParamsDto, query: authorizationDto }),
      (req, res) => this.deleteWorkoutSchedule(req, res),
    );

    router.post(
      '/workout-schedules/:workoutScheduleId/block/workout',
      this.validator.validate({
        params: addWorkoutToBlockParamsDto,
        body: addWorkoutToBlockBodyDto,
        query: authorizationDto,
      }),
      (req, res) => this.addWorkoutToBlock(req, res),
    );

    router.post(
      '/workout-schedules/:workoutScheduleId/block/rest',
      this.validator.validate({
        params: addRestToBlockParamsDto,
        body: addRestToBlockBodyDto,
        query: authorizationDto,
      }),
      (req, res) => this.addRestToBlock(req, res),
    );

    router.delete(
      '/workout-schedules/:workoutScheduleId/block/:blockItemId',
      this.validator.validate({
        params: removeBlockItemParamsDto,
        query: authorizationDto,
      }),
      (req, res) => this.removeBlockItem(req, res),
    );

    router.patch(
      '/workout-schedules/:workoutScheduleId/activate',
      this.validator.validate({ params: setWorkoutScheduleActiveParamsDto, query: authorizationDto }),
      (req, res) => this.setWorkoutScheduleActive(req, res),
    );

    router.patch(
      '/workout-schedules/:workoutScheduleId/deactivate',
      this.validator.validate({ params: setWorkoutScheduleInactiveParamsDto, query: authorizationDto }),
      (req, res) => this.setWorkoutScheduleInActive(req, res),
    );

    return router;
  }
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
    request: Request<RemoveBlockItemParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { userId } = request.query;
    const { workoutScheduleId, blockItemId } = request.params;
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
