import { type Request, type Response } from 'express';
import { injectable } from 'inversify';
import { ExerciseService } from '../../domain/exercise/ExerciseService.js';
import { AuthorizationDto } from '../dto/AuthorizationDto.js';
import {
  CreateExerciseBodyDto,
  DeleteExerciseParamsDto,
  GetExerciseParamsDto,
  UpdateExerciseBodyDto,
  UpdateExerciseParamsDto,
} from '../dto/ExerciseControllerDto.js';

@injectable()
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

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
