import { Router, type Request, type Response } from 'express';
import { injectable } from 'inversify';
import { WorkoutScheduleService } from '../../domain/workoutschedule/WorkoutScheduleService.js';
import {
  AddRestToPatternWorkoutBodyDto,
  addWorkoutToPatternBodyDto,
  addWorkoutToPatternParamsDto,
  AddWorkoutToPatternParamsDto,
  createWorkoutScheduleBodyDto,
  CreateWorkoutScheduleBodyDto,
  deleteWorkoutScheduleParamsDto,
  DeleteWorkoutScheduleParamsDto,
  getWorkoutScheduleParamsDto,
  RemovePatternItemParamsDto,
  GetWorkoutScheduleParamsDto,
  removePatternItemParamsDto,
  setWorkoutScheduleActiveParamsDto,
  SetWorkoutScheduleActiveParamsDto,
  setWorkoutScheduleInactiveParamsDto,
  SetWorkoutScheduleInactiveParamsDto,
  AddRestToPatternWorkoutParamsDto,
  AddWorkoutToPatternBodyDto,
  addRestToPatternWorkoutParamsDto,
  addRestToPatternWorkoutBodyDto,
  RenameWorkoutScheduleBodyDto,
  RenameWorkoutScheduleParamsDto,
  renameWorkoutScheduleBodyDto,
  renameWorkoutScheduleParamsDto,
} from '../dto/WorkoutScheduleControllerDto.js';
import { authorizationDto, AuthorizationDto } from '../dto/AuthorizationDto.js';
import { Controller } from './Controller.js';
import { ParsedData, Validator } from '../validation/Validator.js';

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

    router.get('/workout-schedules', this.validator.validate({ query: authorizationDto }), (req, res) =>
      this.getAllWorkoutSchedules(req, res),
    );

    router.delete(
      '/workout-schedules/:workoutScheduleId',
      this.validator.validate({ params: deleteWorkoutScheduleParamsDto, query: authorizationDto }),
      (req, res) => this.deleteWorkoutSchedule(req, res),
    );

    router.post(
      '/workout-schedules/:workoutScheduleId/pattern/workout',
      this.validator.validate({
        params: addWorkoutToPatternParamsDto,
        body: addWorkoutToPatternBodyDto,
        query: authorizationDto,
      }),
      (req, res) => this.addWorkoutToPattern(req, res),
    );

    router.patch(
      '/workout-schedules/:workoutScheduleId/pattern/:patternItemId',
      this.validator.validate({
        params: addRestToPatternWorkoutParamsDto,
        body: addRestToPatternWorkoutBodyDto,
        query: authorizationDto,
      }),
      (req, res) => this.addRestToPatternWorkout(req, res),
    );

    router.delete(
      '/workout-schedules/:workoutScheduleId/pattern/:patternItemId',
      this.validator.validate({
        params: removePatternItemParamsDto,
        query: authorizationDto,
      }),
      (req, res) => this.removePatternItem(req, res),
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

    router.patch(
      '/workout-schedules/:workoutScheduleId/rename',
      this.validator.validate({
        params: renameWorkoutScheduleParamsDto,
        body: renameWorkoutScheduleBodyDto,
        query: authorizationDto,
      }),
      (req, res) => this.renameWorkoutSchedule(req, res),
    );

    router.get(
      '/workout-schedules/getScheduledActivity',
      this.validator.validate({
        params: getWorkoutScheduleParamsDto,
        query: authorizationDto,
      }),
      (req, res) => this.getScheduledActivity(req, res),
    );

    return router;
  }
  public async createWorkoutSchedule(
    _request: Request<unknown, unknown, CreateWorkoutScheduleBodyDto, AuthorizationDto>,
    response: Response<unknown, ParsedData<unknown, CreateWorkoutScheduleBodyDto, AuthorizationDto>>,
  ): Promise<void> {
    const { name } = response.locals.body;
    const { userId } = response.locals.query;

    const WorkoutSchedule = await this.workoutScheduleService.create(name, userId);
    response.status(201).json(WorkoutSchedule);
  }

  public async getWorkoutSchedule(
    _request: Request<GetWorkoutScheduleParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response<unknown, ParsedData<GetWorkoutScheduleParamsDto, unknown, AuthorizationDto>>,
  ): Promise<void> {
    const { workoutScheduleId } = response.locals.params;
    const { userId } = response.locals.query;
    const workoutSchedule = await this.workoutScheduleService.get(workoutScheduleId, userId);
    response.status(200).json(workoutSchedule);
  }

  public async getAllWorkoutSchedules(
    _request: Request<unknown, unknown, unknown, AuthorizationDto>,
    response: Response<unknown, ParsedData<unknown, unknown, AuthorizationDto>>,
  ): Promise<void> {
    const { userId } = response.locals.query;
    const workoutSchedules = await this.workoutScheduleService.getAll(userId);
    response.status(200).json(workoutSchedules);
  }
  public async deleteWorkoutSchedule(
    _request: Request<DeleteWorkoutScheduleParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response<unknown, ParsedData<DeleteWorkoutScheduleParamsDto, unknown, AuthorizationDto>>,
  ): Promise<void> {
    const { workoutScheduleId } = response.locals.params;
    const { userId } = response.locals.query;
    await this.workoutScheduleService.delete(workoutScheduleId, userId);
    response.status(204).send();
  }

  public async addWorkoutToPattern(
    _request: Request<AddWorkoutToPatternParamsDto, unknown, AddWorkoutToPatternBodyDto, AuthorizationDto>,
    response: Response<unknown, ParsedData<AddWorkoutToPatternParamsDto, AddWorkoutToPatternBodyDto, AuthorizationDto>>,
  ): Promise<void> {
    const { workoutTemplateId } = response.locals.body;
    const { userId } = response.locals.query;
    const { workoutScheduleId } = response.locals.params;
    const workoutSchedule = await this.workoutScheduleService.addWorkoutToPattern(
      workoutTemplateId,
      userId,
      workoutScheduleId,
    );
    response.status(201).json(workoutSchedule);
  }

  public async addRestToPatternWorkout(
    _request: Request<AddRestToPatternWorkoutParamsDto, unknown, AddRestToPatternWorkoutBodyDto, AuthorizationDto>,
    response: Response<
      unknown,
      ParsedData<AddRestToPatternWorkoutParamsDto, AddRestToPatternWorkoutBodyDto, AuthorizationDto>
    >,
  ): Promise<void> {
    const { userId } = response.locals.query;
    const { workoutScheduleId, patternItemId } = response.locals.params;
    const { restDays } = response.locals.body;
    const workoutSchedule = await this.workoutScheduleService.addRestToPatternWorkout(
      userId,
      workoutScheduleId,
      patternItemId,
      restDays,
    );
    response.status(201).json(workoutSchedule);
  }

  public async removePatternItem(
    _request: Request<RemovePatternItemParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response<unknown, ParsedData<RemovePatternItemParamsDto, unknown, AuthorizationDto>>,
  ): Promise<void> {
    const { userId } = response.locals.query;
    const { workoutScheduleId, patternItemId } = response.locals.params;
    const workoutSchedule = await this.workoutScheduleService.removePatternItem(
      userId,
      workoutScheduleId,
      patternItemId,
    );
    response.status(200).json(workoutSchedule);
  }
  public async setWorkoutScheduleActive(
    _request: Request<SetWorkoutScheduleActiveParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response<unknown, ParsedData<SetWorkoutScheduleActiveParamsDto, unknown, AuthorizationDto>>,
  ): Promise<void> {
    const { workoutScheduleId } = response.locals.params;
    const { userId } = response.locals.query;
    const workoutSchedule = await this.workoutScheduleService.setActive(workoutScheduleId, userId);
    response.status(200).json(workoutSchedule);
  }
  public async setWorkoutScheduleInActive(
    _request: Request<SetWorkoutScheduleInactiveParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response<unknown, ParsedData<SetWorkoutScheduleInactiveParamsDto, unknown, AuthorizationDto>>,
  ): Promise<void> {
    const { workoutScheduleId } = response.locals.params;
    const { userId } = response.locals.query;
    const workoutSchedule = await this.workoutScheduleService.setInactive(workoutScheduleId, userId);
    response.status(200).json(workoutSchedule);
  }

  public async renameWorkoutSchedule(
    _request: Request<RenameWorkoutScheduleParamsDto, unknown, RenameWorkoutScheduleBodyDto, AuthorizationDto>,
    response: Response<
      unknown,
      ParsedData<RenameWorkoutScheduleParamsDto, RenameWorkoutScheduleBodyDto, AuthorizationDto>
    >,
  ): Promise<void> {
    const { workoutScheduleId } = response.locals.params;
    const { name } = response.locals.body;
    const { userId } = response.locals.query;
    const workoutSchedule = await this.workoutScheduleService.rename(workoutScheduleId, userId, name);
    response.status(200).json(workoutSchedule);
  }

  public async getScheduledActivity(
    _request: Request<GetWorkoutScheduleParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response<unknown, ParsedData<GetWorkoutScheduleParamsDto, unknown, AuthorizationDto>>,
  ): Promise<void> {
    const { workoutScheduleId } = response.locals.params;
    const { userId } = response.locals.query;
    try {
      const scheduledActivity = await this.workoutScheduleService.getScheduledActivity(workoutScheduleId, userId);
      response.status(200).json(scheduledActivity);
    } catch (error) {
      if (error instanceof Error && error.message == 'scheduled activity was skipped') {
        response.status(404).json('scheduled activity was skipped');
      }
    }
  }
}
