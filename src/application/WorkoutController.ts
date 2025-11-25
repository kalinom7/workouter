import { type UUID } from 'node:crypto';
import { type WorkoutService } from '../domain/workout/WorkoutService.js';
import { type Request, type Response } from 'express';
import z from 'zod';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types.js';

export const startWorkoutFromTemplateDto = z.object({
  userId: z.uuid().transform((str) => str as UUID),
  workoutTemplateId: z.uuid().transform((str) => str as UUID),
});
type StartWorkoutFromTemplateDto = z.infer<typeof startWorkoutFromTemplateDto>;

export const finishWorkoutDto = z.object({
  userId: z.uuid().transform((str) => str as UUID),
  workoutId: z.uuid().transform((str) => str as UUID),
});
type FinishWorkoutDto = z.infer<typeof finishWorkoutDto>;
@injectable()
export class WorkoutController {
  constructor(
    @inject(TYPES.WorkoutService)
    private readonly workoutService: WorkoutService,
  ) {}

  public async startWorkoutFromTemplate(
    request: Request<unknown, unknown, StartWorkoutFromTemplateDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { userId, workoutTemplateId } = request.body;
    const workout = await this.workoutService.startWorkoutFromTemplate(new Date(), userId, workoutTemplateId);
    response.status(201).json(workout);
  }
  public async finishWorkout(
    request: Request<unknown, unknown, FinishWorkoutDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { userId, workoutId } = request.body;
    const workout = await this.workoutService.finishWorkout(userId, workoutId, new Date());
    response.status(200).json(workout);
  }
}
