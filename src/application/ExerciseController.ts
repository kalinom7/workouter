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
}
