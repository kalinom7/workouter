import { Router, type Request, type Response } from 'express';
import { injectable } from 'inversify';
import { WorkoutTemplateService } from '../../domain/workouttemplate/WorkoutTemplateService.js';
import {
  AddWorkoutTemplateExerciseBodyDto,
  AddWorkoutTemplateExerciseParamsDto,
  DeleteWorkoutTemplateParamsDto,
  RemoveWorkoutTemplateExerciseParamsDto,
  CreateWorkoutTemplateBodyDto,
  GetWorkoutTemplateParamsDto,
  createWorkoutTemplateBodyDto,
  addWorkoutTemplateExerciseParamsDto,
  addWorkoutTemplateExerciseBodyDto,
  removeWorkoutTemplateExerciseParamsDto,
  getWorkoutTemplateParamsDto,
  deleteWorkoutTemplateParamsDto,
  editWorkoutTemplateExerciseBodyDto,
  editWorkoutTemplateExerciseParamsDto,
  EditWorkoutTemplateExerciseBodyDto,
  EditWorkoutTemplateExerciseParamsDto,
  EditWorkoutTemplateNameBodyDto,
  EditWorkoutTemplateNameParamsDto,
  editWorkoutTemplateNameBodyDto,
  editWorkoutTemplateNameParamsDto,
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
    router.patch(
      `/workout-templates/:workoutTemplateId/edit-name`,
      this.validator.validate({
        params: editWorkoutTemplateNameParamsDto,
        body: editWorkoutTemplateNameBodyDto,
        query: authorizationDto,
      }),
      (req, res) => this.editName(req, res),
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

    router.put(
      '/workout-templates/:workoutTemplateId/exercises/:order',
      this.validator.validate({
        params: editWorkoutTemplateExerciseParamsDto,
        body: editWorkoutTemplateExerciseBodyDto,
        query: authorizationDto,
      }),
      (req, res) => this.editWorkoutTemplateExercise(req, res),
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

  public async editName(
    _request: Request<EditWorkoutTemplateNameParamsDto, unknown, EditWorkoutTemplateNameBodyDto, AuthorizationDto>,
    response: Response<
      unknown,
      ParsedData<EditWorkoutTemplateNameParamsDto, EditWorkoutTemplateNameBodyDto, AuthorizationDto>
    >,
  ): Promise<void> {
    const { workoutTemplateId } = response.locals.params;
    const { newName } = response.locals.body;
    const { userId } = response.locals.query;
    const workoutTemplate = await this.workoutTemplateService.editWorkoutTemplateName(
      workoutTemplateId,
      userId,
      newName,
    );
    response.status(200).json(workoutTemplate);
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
    const { exerciseId, sets, restPeriod } = response.locals.body;
    const { userId } = response.locals.query;
    const { workoutTemplateId } = response.locals.params;
    const workoutTemplate = await this.workoutTemplateService.addWorkoutTemplateExercise(
      exerciseId,
      workoutTemplateId,
      userId,
      sets,
      restPeriod,
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

  public async editWorkoutTemplateExercise(
    _request: Request<
      EditWorkoutTemplateExerciseParamsDto,
      unknown,
      EditWorkoutTemplateExerciseBodyDto,
      AuthorizationDto
    >,
    response: Response<
      unknown,
      ParsedData<EditWorkoutTemplateExerciseParamsDto, EditWorkoutTemplateExerciseBodyDto, AuthorizationDto>
    >,
  ): Promise<void> {
    const { userId } = response.locals.query;
    const { workoutTemplateId, order } = response.locals.params;
    const { exerciseId, sets, restPeriod } = response.locals.body;

    await this.workoutTemplateService.editWorkoutTemplateExercise(
      workoutTemplateId,
      userId,
      order,
      exerciseId,
      sets,
      restPeriod,
    );
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
