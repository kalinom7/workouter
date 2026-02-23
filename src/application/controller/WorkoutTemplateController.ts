import { Router, type Request, type Response } from 'express';
import { injectable } from 'inversify';
import { WorkoutTemplateService } from '../../domain/workouttemplate/WorkoutTemplateService.js';
import {
  AddWorkoutTemplateExerciseBodyDto,
  AddWorkoutTemplateExerciseParamsDto,
  DeleteWorkoutTemplateParamsDto,
  RemoveWorkoutTemplateExerciseParamsDto,
  SetNumberOfSetsBodyDto,
  SetNumberOfSetsParamsDto,
  SetRestPeriodBodyDto,
  SetRestPeriodParamsDto,
  CreateWorkoutTemplateBodyDto,
  GetWorkoutTemplateParamsDto,
  createWorkoutTemplateBodyDto,
  addWorkoutTemplateExerciseParamsDto,
  addWorkoutTemplateExerciseBodyDto,
  removeWorkoutTemplateExerciseParamsDto,
  setNumberOfSetsParamsDto,
  setNumberOfSetsBodyDto,
  setRestPeriodParamsDto,
  setRestPeriodBodyDto,
  getWorkoutTemplateParamsDto,
  deleteWorkoutTemplateParamsDto,
} from '../dto/WorkoutTemplateControllerDto.js';
import { authorizationDto, AuthorizationDto } from '../dto/AuthorizationDto.js';
import { Controller } from './Controller.js';
import { Validator } from '../validation/Validator.js';

@injectable()
export class WorkoutTemplateController extends Controller {
  constructor(
    private readonly workoutTemplateService: WorkoutTemplateService,
    private readonly validator: Validator,
  ) {
    super();
  }

  public getRoutes(): Router {
    const router = Router();

    router.post(
      '/workout-templates',
      this.validator.validate({ body: createWorkoutTemplateBodyDto, query: authorizationDto }),
      (req, res) => this.create(req, res),
    );
    router.post(
      '/workout-templates/:workoutTemplateId/exercises',
      this.validator.validate({
        params: addWorkoutTemplateExerciseParamsDto,
        body: addWorkoutTemplateExerciseBodyDto,
        query: authorizationDto,
      }),
      (req, res) => this.addWorkoutTemplateExercise(req, res),
    );

    router.delete(
      '/workout-templates/:workoutTemplateId/exercises/:order',
      this.validator.validate({
        params: removeWorkoutTemplateExerciseParamsDto,
        query: authorizationDto,
      }),
      (req, res) => this.removeWorkoutTemplateExercise(req, res),
    );

    router.patch(
      '/workout-templates/:workoutTemplateId/exercises/:order/sets',
      this.validator.validate({
        params: setNumberOfSetsParamsDto,
        body: setNumberOfSetsBodyDto,
        query: authorizationDto,
      }),
      (req, res) => this.setNumberOfSets(req, res),
    );

    router.patch(
      '/workout-templates/:workoutTemplateId/exercises/:order/rest-period',
      this.validator.validate({
        params: setRestPeriodParamsDto,
        body: setRestPeriodBodyDto,
        query: authorizationDto,
      }),
      (req, res) => this.setRestPeriod(req, res),
    );

    router.get(
      '/workout-templates/:workoutTemplateId',
      this.validator.validate({ params: getWorkoutTemplateParamsDto, query: authorizationDto }),
      (req, res) => this.getWorkoutTemplate(req, res),
    );

    router.delete(
      '/workout-templates/:workoutTemplateId',
      this.validator.validate({ params: deleteWorkoutTemplateParamsDto, query: authorizationDto }),
      (req, res) => this.deleteWorkoutTemplate(req, res),
    );

    return router;
  }

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
    request: Request<RemoveWorkoutTemplateExerciseParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { userId } = request.query;
    const { workoutTemplateId, order } = request.params;
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
    console.log('order type:', typeof order);
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
