import { type Request, type Response } from 'express';
import { injectable } from 'inversify';
import { WorkoutService } from '../../domain/workout/WorkoutService.js';
import {
  AddExerciseBodyDto,
  AddExerciseParamsDto,
  AddSetParamsDto,
  AddWeightAndRepsBodyDto,
  AddWeightAndRepsParamsDto,
  FinishWorkoutParamsDto,
  MarkExerciseAsCompletedParamsDto,
  MarkExerciseAsUnCompletedParamsDto,
  MarkSetAsCompletedParamsDto,
  MarkSetAsUnCompletedParamsDto,
  RemoveExerciseParamsDto,
  RemoveSetParamsDto,
  StartWorkoutFromTemplateBodyDto,
} from '../dto/WorkoutControllerDto.js';
import { AuthorizationDto } from '../dto/AuthorizationDto.js';

@injectable()
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  public async startWorkoutFromTemplate(
    request: Request<unknown, unknown, StartWorkoutFromTemplateBodyDto, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { workoutTemplateId } = request.body;
    const { userId } = request.query;
    const workout = await this.workoutService.startWorkoutFromTemplate(new Date(), userId, workoutTemplateId);
    response.status(201).json(workout);
  }

  public async startEmptyWorkout(
    request: Request<unknown, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { userId } = request.query;
    const workout = await this.workoutService.startEmptyWorkout(new Date(), userId);
    response.status(201).json(workout);
  }

  public async finishWorkout(
    request: Request<FinishWorkoutParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { workoutId } = request.params;
    const { userId } = request.query;
    await this.workoutService.finishWorkout(userId, workoutId, new Date());
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  public async addExercise(
    request: Request<AddExerciseParamsDto, unknown, AddExerciseBodyDto, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { exerciseId } = request.body;
    const { userId } = request.query;
    const { workoutId } = request.params;
    await this.workoutService.addExercise(userId, workoutId, exerciseId);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(201).json(workout);
  }

  public async removeExercise(
    request: Request<RemoveExerciseParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { workoutId, exerciseOrder } = request.params;
    const { userId } = request.query;
    await this.workoutService.removeExercise(userId, workoutId, exerciseOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  public async addSet(
    request: Request<AddSetParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { workoutId, exerciseOrder } = request.params;
    const { userId } = request.query;
    await this.workoutService.addSet(userId, workoutId, exerciseOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(201).json(workout);
  }

  public async removeSet(
    request: Request<RemoveSetParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { workoutId, exerciseOrder, setOrder } = request.params;
    const { userId } = request.query;
    await this.workoutService.removeSet(userId, workoutId, exerciseOrder, setOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  public async addWeightAndReps(
    request: Request<AddWeightAndRepsParamsDto, unknown, AddWeightAndRepsBodyDto, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { weight, reps } = request.body;
    const { userId } = request.query;
    const { workoutId, exerciseOrder, setOrder } = request.params;
    await this.workoutService.addWeightAndReps(userId, workoutId, exerciseOrder, setOrder, weight, reps);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  public async markSetAsCompleted(
    request: Request<MarkSetAsCompletedParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { userId } = request.query;
    const { workoutId, exerciseOrder, setOrder } = request.params;
    await this.workoutService.markSetAsCompleted(userId, workoutId, exerciseOrder, setOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  public async markSetAsUncompleted(
    request: Request<MarkSetAsUnCompletedParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { userId } = request.query;
    const { workoutId, exerciseOrder, setOrder } = request.params;
    await this.workoutService.markSetAsUnCompleted(userId, workoutId, exerciseOrder, setOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  public async markExerciseAsCompleted(
    request: Request<MarkExerciseAsCompletedParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { userId } = request.query;
    const { workoutId, exerciseOrder } = request.params;
    await this.workoutService.markExerciseAsCompleted(userId, workoutId, exerciseOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  public async markExerciseAsUncompleted(
    request: Request<MarkExerciseAsUnCompletedParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { userId } = request.query;
    const { workoutId, exerciseOrder } = request.params;
    await this.workoutService.markExerciseAsUnCompleted(userId, workoutId, exerciseOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }
}
