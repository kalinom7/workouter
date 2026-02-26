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
import { ParsedData, Validator } from '../validation/Validator.js';

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

    router.get('/workout-templates', this.validator.validate({ query: authorizationDto }), (req, res) =>
      this.getAllWorkoutTemplates(req, res),
    );

    router.delete(
      '/workout-templates/:workoutTemplateId',
      this.validator.validate({ params: deleteWorkoutTemplateParamsDto, query: authorizationDto }),
      (req, res) => this.deleteWorkoutTemplate(req, res),
    );

    return router;
  }

  public async create(
    _request: Request<unknown, unknown, CreateWorkoutTemplateBodyDto, AuthorizationDto>,
    response: Response<unknown, ParsedData<unknown, CreateWorkoutTemplateBodyDto, AuthorizationDto>>,
  ): Promise<void> {
    const { name } = response.locals.body;
    const { userId } = response.locals.query;
    const workoutTemplate = await this.workoutTemplateService.createWorkoutTemplate(name, userId);
    response.status(201).json(workoutTemplate);
  }

  public async addWorkoutTemplateExercise(
    _request: Request<
      AddWorkoutTemplateExerciseParamsDto,
      unknown,
      AddWorkoutTemplateExerciseBodyDto,
      AuthorizationDto
    >,
    response: Response<
      unknown,
      ParsedData<AddWorkoutTemplateExerciseParamsDto, AddWorkoutTemplateExerciseBodyDto, AuthorizationDto>
    >,
  ): Promise<void> {
    const { exerciseId } = response.locals.body;
    const { userId } = response.locals.query;
    const { workoutTemplateId } = response.locals.params;
    const workoutTemplate = await this.workoutTemplateService.addWorkoutTemplateExercise(
      exerciseId,
      workoutTemplateId,
      userId,
    );
    response.status(201).json(workoutTemplate);
  }
  public async removeWorkoutTemplateExercise(
    _request: Request<RemoveWorkoutTemplateExerciseParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response<unknown, ParsedData<RemoveWorkoutTemplateExerciseParamsDto, unknown, AuthorizationDto>>,
  ): Promise<void> {
    const { userId } = response.locals.query;
    const { workoutTemplateId, order } = response.locals.params;
    await this.workoutTemplateService.removeWorkoutTemplateExercise(workoutTemplateId, userId, order);
    const workoutTemplate = await this.workoutTemplateService.getWorkoutTemplate(workoutTemplateId, userId);
    response.status(200).json(workoutTemplate);
  }

  public async setNumberOfSets(
    _request: Request<SetNumberOfSetsParamsDto, unknown, SetNumberOfSetsBodyDto, AuthorizationDto>,
    response: Response<unknown, ParsedData<SetNumberOfSetsParamsDto, SetNumberOfSetsBodyDto, AuthorizationDto>>,
  ): Promise<void> {
    const { sets } = response.locals.body;
    const { workoutTemplateId, order } = response.locals.params;
    const { userId } = response.locals.query;
    console.log('order type:', typeof order);
    await this.workoutTemplateService.setNumberOfSets(sets, workoutTemplateId, userId, order);
    const workoutTemplate = await this.workoutTemplateService.getWorkoutTemplate(workoutTemplateId, userId);
    response.status(200).json(workoutTemplate);
  }

  public async setRestPeriod(
    _request: Request<SetRestPeriodParamsDto, unknown, SetRestPeriodBodyDto, AuthorizationDto>,
    response: Response<unknown, ParsedData<SetRestPeriodParamsDto, SetRestPeriodBodyDto, AuthorizationDto>>,
  ): Promise<void> {
    const { restPeriod } = response.locals.body;
    const { workoutTemplateId, order } = response.locals.params;
    const { userId } = response.locals.query;
    await this.workoutTemplateService.setRestPeriod(restPeriod, workoutTemplateId, userId, order);
    const workoutTemplate = await this.workoutTemplateService.getWorkoutTemplate(workoutTemplateId, userId);
    response.status(200).json(workoutTemplate);
  }

  public async getWorkoutTemplate(
    _request: Request<GetWorkoutTemplateParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response<unknown, ParsedData<GetWorkoutTemplateParamsDto, unknown, AuthorizationDto>>,
  ): Promise<void> {
    const { workoutTemplateId } = response.locals.params;
    const { userId } = response.locals.query;
    const workoutTemplate = await this.workoutTemplateService.getWorkoutTemplate(workoutTemplateId, userId);
    response.status(200).json(workoutTemplate);
  }

  public async getAllWorkoutTemplates(
    _request: Request<unknown, unknown, unknown, AuthorizationDto>,
    response: Response<unknown, ParsedData<unknown, unknown, AuthorizationDto>>,
  ): Promise<void> {
    const { userId } = response.locals.query;
    const workoutTemplates = await this.workoutTemplateService.getAllWorkoutTemplates(userId);
    response.status(200).json(workoutTemplates);
  }

  public async deleteWorkoutTemplate(
    _request: Request<DeleteWorkoutTemplateParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response<unknown, ParsedData<DeleteWorkoutTemplateParamsDto, unknown, AuthorizationDto>>,
  ): Promise<void> {
    const { workoutTemplateId } = response.locals.params;
    const { userId } = response.locals.query;
    await this.workoutTemplateService.deleteWorkoutTemplate(workoutTemplateId, userId);
    response.status(204).send();
  }
}
