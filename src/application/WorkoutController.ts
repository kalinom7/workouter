import { type UUID } from 'node:crypto';
import { type WorkoutService } from '../domain/workout/WorkoutService.js';
import { type Request, type Response } from 'express';
import z from 'zod';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types.js';
export const startWorkoutDto = z.object({
  userId: z.uuid().transform((str) => str as UUID),
  workoutTemplateId: z.uuid().transform((str) => str as UUID),
});

type StartWorkoutDto = z.infer<typeof startWorkoutDto>;
@injectable()
export class WorkoutController {
  constructor(
    @inject(TYPES.WorkoutService)
    private readonly workoutService: WorkoutService,
  ) {}

  public async start(request: Request<unknown, unknown, StartWorkoutDto, unknown>, response: Response): Promise<void> {
    const { userId, workoutTemplateId } = request.body;
    const workout = await this.workoutService.startWorkoutFromTemplate(new Date(), userId, workoutTemplateId);
    response.status(201).json(workout);
  }
}
