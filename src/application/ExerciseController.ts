import { injectable, inject } from 'inversify';
import { TYPES } from '../types.js';
import { type ExerciseService } from '../domain/exercise/ExerciseService.js';
import { type Request, type Response } from 'express';
import { type UUID } from 'node:crypto';
import { z } from 'zod';

export const createExerciseDto = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  userId: z.uuid().transform((str) => str as UUID),
});
type CreateExerciseDto = z.infer<typeof createExerciseDto>;

export const getExerciseOrDeleteDto = z.object({
  exerciseId: z.uuid().transform((str) => str as UUID),
  userId: z.uuid().transform((str) => str as UUID),
});
type GetExerciseDto = z.infer<typeof getExerciseOrDeleteDto>;

export const updateExerciseDto = z.object({
  exerciseId: z.uuid().transform((str) => str as UUID),
  name: z.string().min(1),
  description: z.string().optional(),
  userId: z.uuid().transform((str) => str as UUID),
});
type UpdateExerciseDto = z.infer<typeof updateExerciseDto>;
@injectable()
export class ExerciseController {
  constructor(
    @inject(TYPES.ExerciseService)
    private readonly exerciseService: ExerciseService,
  ) {}

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
