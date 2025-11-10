import { injectable, inject } from 'inversify';
import { type UUID } from 'node:crypto';
import { type WorkoutTemplateService } from '../domain/workouttemplate/WorkoutTemplateService.js';
import { type Request, type Response } from 'express';
import z from 'zod';
import { TYPES } from '../types.js';

export const createWorkoutTemplateDto = z.object({
  name: z.string().min(1),
  userId: z.uuid().transform((str) => str as UUID),
});
type CreateWorkoutTemplateDto = z.infer<typeof createWorkoutTemplateDto>;

export const addWorkoutTemplateExerciseDto = z.object({
  exerciseId: z.uuid().transform((str) => str as UUID),
  workoutTemplateId: z.uuid().transform((str) => str as UUID),
  userId: z.uuid().transform((str) => str as UUID),
});
type addWorkoutTemplateExerciseDto = z.infer<typeof addWorkoutTemplateExerciseDto>;

export const removeWorkoutTemplateExerciseDto = z.object({
  workoutTemplateId: z.uuid().transform((str) => str as UUID),
  exerciseId: z.uuid().transform((str) => str as UUID),
  order: z.number().min(0),
});
type removeWorkoutTemplateExerciseDto = z.infer<typeof removeWorkoutTemplateExerciseDto>;

@injectable()
export class WorkoutTemplateController {
  constructor(
    @inject(TYPES.WorkoutTemplateService)
    private readonly workoutTemplateService: WorkoutTemplateService,
  ) {}

  public async create(
    request: Request<unknown, unknown, CreateWorkoutTemplateDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { name, userId } = request.body;
    const workoutTemplate = await this.workoutTemplateService.createWorkoutTemplate(name, userId);
    response.status(201).json(workoutTemplate);
  }

  public async addWorkoutTemplateExercise(
    request: Request<unknown, unknown, addWorkoutTemplateExerciseDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { exerciseId, workoutTemplateId, userId } = request.body;
    const workoutTemplate = await this.workoutTemplateService.addWorkoutTemplateExercise(
      exerciseId,
      workoutTemplateId,
      userId,
    );
    response.status(201).json(workoutTemplate);
  }
  public async removeWorkoutTemplateExercise(
    request: Request<unknown, unknown, removeWorkoutTemplateExerciseDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { exerciseId, workoutTemplateId, order } = request.body;
    const workoutTemplate = await this.workoutTemplateService.removeWorkoutTemplateExercise(
      exerciseId,
      workoutTemplateId,
      order,
    );
    response.status(200).json(workoutTemplate);
  }
}
