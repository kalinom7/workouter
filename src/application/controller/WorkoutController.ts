import { type Request, type Response } from 'express';
import { injectable } from 'inversify';
import { WorkoutService } from '../../domain/workout/WorkoutService.js';
import {
  type AddExerciseDto,
  type AddWeightAndRepsDto,
  type FinishWorkoutDto,
  type MarkExercise,
  type MarkSet,
  type RemoveExerciseAddSetDto,
  type RemoveSetDto,
  type StartEmptyWorkoutDto,
  type StartWorkoutFromTemplateDto,
} from '../dto/WorkoutControllerDto.js';

@injectable()
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  public async startWorkoutFromTemplate(
    request: Request<unknown, unknown, StartWorkoutFromTemplateDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { userId, workoutTemplateId } = request.body;
    const workout = await this.workoutService.startWorkoutFromTemplate(new Date(), userId, workoutTemplateId);
    response.status(201).json(workout);
  }

  public async startEmptyWorkout(
    request: Request<unknown, unknown, StartEmptyWorkoutDto, unknown>,
    response: Response,
  ): Promise<void> {
    const { userId } = request.body;
    const workout = await this.workoutService.startEmptyWorkout(new Date(), userId);
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

  public async removeSet(request: Request<unknown, unknown, RemoveSetDto, unknown>, response: Response): Promise<void> {
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
    request: Request<unknown, unknown, MarkSet, unknown>,
    response: Response,
  ): Promise<void> {
    const { userId, workoutId, exerciseOrder, setOrder } = request.body;
    await this.workoutService.markSetAsCompleted(userId, workoutId, exerciseOrder, setOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  public async markSetAsUncompleted(
    request: Request<unknown, unknown, MarkSet, unknown>,
    response: Response,
  ): Promise<void> {
    const { userId, workoutId, exerciseOrder, setOrder } = request.body;
    await this.workoutService.markSetAsUnCompleted(userId, workoutId, exerciseOrder, setOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  public async markExerciseAsCompleted(
    request: Request<unknown, unknown, MarkExercise, unknown>,
    response: Response,
  ): Promise<void> {
    const { userId, workoutId, exerciseOrder } = request.body;
    await this.workoutService.markExerciseAsCompleted(userId, workoutId, exerciseOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  public async markExerciseAsUncompleted(
    request: Request<unknown, unknown, MarkExercise, unknown>,
    response: Response,
  ): Promise<void> {
    const { userId, workoutId, exerciseOrder } = request.body;
    await this.workoutService.markExerciseAsUnCompleted(userId, workoutId, exerciseOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }
}
