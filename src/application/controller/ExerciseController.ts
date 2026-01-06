import { Router, type Request, type Response } from 'express';
import { injectable } from 'inversify';
import { ExerciseService } from '../../domain/exercise/ExerciseService.js';
import { authorizationDto, AuthorizationDto } from '../dto/AuthorizationDto.js';
import {
  createExerciseBodyDto,
  CreateExerciseBodyDto,
  DeleteExerciseParamsDto,
  getExerciseParamsDto,
  GetExerciseParamsDto,
  UpdateExerciseBodyDto,
  UpdateExerciseParamsDto,
} from '../dto/ExerciseControllerDto.js';
import { Controller } from './Controller.js';
import { Validator } from '../validation/Validator.js';

@injectable()
export class ExerciseController extends Controller {
  constructor(
    private readonly exerciseService: ExerciseService,
    private readonly validator: Validator,
  ) {
    super();
  }

  public getRoutes(): Router {
    const router = Router();

    router.post(
      '/exercises',
      this.validator.validate({ body: createExerciseBodyDto, query: authorizationDto }),
      (req, res) => this.create(req, res),
    );
    router.get(
      '/exercises/:exerciseId',
      this.validator.validate({ params: getExerciseParamsDto, query: authorizationDto }),
      (req, res) => this.get(req, res),
    );
    router.patch(
      '/exercises/:exerciseId',
      this.validator.validate({
        params: getExerciseParamsDto,
        body: createExerciseBodyDto,
        query: authorizationDto,
      }),
      (req, res) => this.update(req, res),
    );
    router.delete(
      '/exercises/:exerciseId',
      this.validator.validate({ params: getExerciseParamsDto, query: authorizationDto }),
      (req, res) => this.delete(req, res),
    );

    return router;
  }

  public async create(
    request: Request<unknown, unknown, CreateExerciseBodyDto, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { name, description } = request.body;
    const { userId } = request.query;
    const exercise = await this.exerciseService.create(name, userId, description);
    response.status(201).json(exercise);
  }

  public async get(
    request: Request<GetExerciseParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { exerciseId } = request.params;
    const { userId } = request.query;
    const exercise = await this.exerciseService.get(exerciseId, userId);
    response.status(200).json(exercise);
  }

  public async update(
    request: Request<UpdateExerciseParamsDto, unknown, UpdateExerciseBodyDto, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { name, description } = request.body;
    const { exerciseId } = request.params;
    const { userId } = request.query;
    const exercise = await this.exerciseService.update(exerciseId, name, userId, description);
    response.status(200).json(exercise);
  }
  public async delete(
    request: Request<DeleteExerciseParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { exerciseId } = request.params;
    const { userId } = request.query;
    await this.exerciseService.delete(exerciseId, userId);
    response.status(204).send();
  }
}
