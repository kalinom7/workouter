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

export const startEmptyWorkoutDto = z.object({
  userId: z.uuid().transform((str) => str as UUID),
});
type StartEmptyWorkoutDto = z.infer<typeof startEmptyWorkoutDto>;

export const addExerciseDto = z.object({
  userId: z.uuid().transform((str) => str as UUID),
  workoutId: z.uuid().transform((str) => str as UUID),
  exerciseId: z.uuid().transform((str) => str as UUID),
});
type AddExerciseDto = z.infer<typeof addExerciseDto>;

export const removeExerciseAddSetDto = z.object({
  userId: z.uuid().transform((str) => str as UUID),
  workoutId: z.uuid().transform((str) => str as UUID),
  exerciseOrder: z.number().int().min(0),
});
type RemoveExerciseAddSetDto = z.infer<typeof removeExerciseAddSetDto>;

export const removeSetDto = z.object({
  userId: z.uuid().transform((str) => str as UUID),
  workoutId: z.uuid().transform((str) => str as UUID),
  exerciseOrder: z.number().int().min(0),
  setOrder: z.number().int().min(0),
});
type RemoveSetDto = z.infer<typeof removeSetDto>;
type markSet = z.infer<typeof removeSetDto>;

export const addWeightAndRepsDto = z.object({
  userId: z.uuid().transform((str) => str as UUID),
  workoutId: z.uuid().transform((str) => str as UUID),
  exerciseOrder: z.number().int().min(0),
  setOrder: z.number().int().min(0),
  weight: z.number().nonnegative(),
  reps: z.number().int().nonnegative(),
});
type AddWeightAndRepsDto = z.infer<typeof addWeightAndRepsDto>;

export const markExercise = z.object({
  userId: z.uuid().transform((str) => str as UUID),
  workoutId: z.uuid().transform((str) => str as UUID),
  exerciseOrder: z.number().int().min(0),
});
type markExercise = z.infer<typeof markExercise>;

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

  public async StartEmptyWorkout(
    request: Request<unknown, unknown, StartEmptyWorkoutDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { userId } = request.body;
    const workout = await this.workoutService.StartEmptyWorkout(new Date(), userId);
    response.status(201).json(workout);
  }

  public async finishWorkout(
    request: Request<unknown, unknown, FinishWorkoutDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { userId, workoutId } = request.body;
    await this.workoutService.finishWorkout(userId, workoutId, new Date());
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  public async addExercise(
    request: Request<unknown, unknown, AddExerciseDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { userId, workoutId, exerciseId } = request.body;
    await this.workoutService.addExercise(userId, workoutId, exerciseId);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  public async removeExercise(
    request: Request<unknown, unknown, RemoveExerciseAddSetDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { userId, workoutId, exerciseOrder } = request.body;
    await this.workoutService.removeExercise(userId, workoutId, exerciseOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  public async addSet(
    request: Request<unknown, unknown, RemoveExerciseAddSetDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { userId, workoutId, exerciseOrder } = request.body;
    await this.workoutService.addSet(userId, workoutId, exerciseOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  public async RemoveSet(request: Request<unknown, unknown, RemoveSetDto, unknown>, response: Response): Promise<void> {
    const { userId, workoutId, exerciseOrder, setOrder } = request.body;
    await this.workoutService.removeSet(userId, workoutId, exerciseOrder, setOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  public async addWeightAndReps(
    request: Request<unknown, unknown, AddWeightAndRepsDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { userId, workoutId, exerciseOrder, setOrder, weight, reps } = request.body;
    await this.workoutService.addWeightAndReps(userId, workoutId, exerciseOrder, setOrder, weight, reps);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  public async markSetAsCompleted(
    request: Request<unknown, unknown, markSet, unknown>,
    response: Response,
  ): Promise<void> {
    const { userId, workoutId, exerciseOrder, setOrder } = request.body;
    await this.workoutService.markSetAsCompleted(userId, workoutId, exerciseOrder, setOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  public async markSetAsUncompleted(
    request: Request<unknown, unknown, markSet, unknown>,
    response: Response,
  ): Promise<void> {
    const { userId, workoutId, exerciseOrder, setOrder } = request.body;
    await this.workoutService.markSetAsUnCompleted(userId, workoutId, exerciseOrder, setOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  public async markExerciseAsCompleted(
    request: Request<unknown, unknown, markExercise, unknown>,
    response: Response,
  ): Promise<void> {
    const { userId, workoutId, exerciseOrder } = request.body;
    await this.workoutService.markExerciseAsCompleted(userId, workoutId, exerciseOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  public async markExerciseAsUncompleted(
    request: Request<unknown, unknown, markExercise, unknown>,
    response: Response,
  ): Promise<void> {
    const { userId, workoutId, exerciseOrder } = request.body;
    await this.workoutService.markExerciseAsUnCompleted(userId, workoutId, exerciseOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }
}
