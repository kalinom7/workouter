import { type Request, type Response } from 'express';
import { injectable } from 'inversify';
import { ExerciseService } from '../../domain/exercise/ExerciseService.js';
import { type CreateExerciseDto, type GetExerciseDto, type UpdateExerciseDto } from '../dto/ExerciseControllerDto.js';

@injectable()
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  public async create(
    request: Request<unknown, unknown, CreateExerciseDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { name, description, userId } = request.body;
    const exercise = await this.exerciseService.create(name, userId, description);
    response.status(201).json(exercise);
  }

  public async get(request: Request<unknown, unknown, GetExerciseDto, unknown>, response: Response): Promise<void> {
    const { exerciseId, userId } = request.body;
    const exercise = await this.exerciseService.get(exerciseId, userId);
    response.status(200).json(exercise);
  }

  public async update(
    request: Request<unknown, unknown, UpdateExerciseDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { exerciseId, name, description, userId } = request.body;
    const exercise = await this.exerciseService.update(exerciseId, name, userId, description);
    response.status(200).json(exercise);
  }
  public async delete(request: Request<unknown, unknown, GetExerciseDto, unknown>, response: Response): Promise<void> {
    const { exerciseId, userId } = request.body;
    await this.exerciseService.delete(exerciseId, userId);
    response.status(204).send();
  }
}
