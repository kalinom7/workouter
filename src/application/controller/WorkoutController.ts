import { Router, type Request, type Response } from 'express';
import { injectable } from 'inversify';
import { WorkoutService } from '../../domain/workout/WorkoutService.js';
import { authorizationDto, AuthorizationDto } from '../dto/AuthorizationDto.js';
import {
  AddExerciseBodyDto,
  addExerciseBodyDto,
  AddExerciseParamsDto,
  addExerciseParamsDto,
  AddSetParamsDto,
  addSetParamsDto,
  AddWeightAndRepsBodyDto,
  addWeightAndRepsBodyDto,
  AddWeightAndRepsParamsDto,
  addWeightAndRepsParamsDto,
  FinishWorkoutParamsDto,
  finishWorkoutParamsDto,
  getWorkoutParamsDto,
  GetWorkoutParamsDto,
  markExerciseAsCompletedParamsDto,
  MarkExerciseAsCompletedParamsDto,
  markExerciseAsUnCompletedParamsDto,
  MarkExerciseAsUnCompletedParamsDto,
  MarkSetAsCompletedParamsDto,
  markSetAsCompletedParamsDto,
  MarkSetAsUnCompletedParamsDto,
  markSetAsUnCompletedParamsDto,
  RemoveExerciseParamsDto,
  removeExerciseParamsDto,
  RemoveSetParamsDto,
  removeSetParamsDto,
  StartWorkoutFromTemplateBodyDto,
  startWorkoutFromTemplateBodyDto,
} from '../dto/WorkoutControllerDto.js';
import { Validator } from '../validation/Validator.js';
import { Controller } from './Controller.js';

@injectable()
export class WorkoutController extends Controller {
  constructor(
    private readonly workoutService: WorkoutService,
    private readonly validator: Validator,
  ) {
    super();
  }

  public getRoutes(): Router {
    const router = Router();

    router.post(
      '/workouts/from-template',
      this.validator.validate({ body: startWorkoutFromTemplateBodyDto, query: authorizationDto }),
      (req, res) => this.startWorkoutFromTemplate(req, res),
    );

    router.post('/workouts/empty', this.validator.validate({ query: authorizationDto }), (req, res) =>
      this.startEmptyWorkout(req, res),
    );

    router.get(
      '/workouts/:workoutId',
      this.validator.validate({ params: getWorkoutParamsDto, query: authorizationDto }),
      (req, res) => this.getWorkout(req, res),
    );

    router.patch(
      '/workouts/:workoutId/finish',
      this.validator.validate({ params: finishWorkoutParamsDto, query: authorizationDto }),
      (req, res) => this.finishWorkout(req, res),
    );

    router.post(
      '/workouts/:workoutId/exercises',
      this.validator.validate({ body: addExerciseBodyDto, params: addExerciseParamsDto, query: authorizationDto }),
      (req, res) => this.addExercise(req, res),
    );

    router.delete(
      '/workouts/:workoutId/exercises/:exerciseOrder',
      this.validator.validate({ params: removeExerciseParamsDto, query: authorizationDto }),
      (req, res) => this.removeExercise(req, res),
    );

    router.post(
      '/workouts/:workoutId/exercises/:exerciseOrder/sets',
      this.validator.validate({ params: addSetParamsDto, query: authorizationDto }),
      (req, res) => this.addSet(req, res),
    );

    router.delete(
      '/workouts/:workoutId/exercises/:exerciseOrder/sets/:setOrder',
      this.validator.validate({ params: removeSetParamsDto, query: authorizationDto }),
      (req, res) => this.removeSet(req, res),
    );

    router.patch(
      '/workouts/:workoutId/exercises/:exerciseOrder/sets/:setOrder/weight-and-reps',
      this.validator.validate({
        body: addWeightAndRepsBodyDto,
        params: addWeightAndRepsParamsDto,
        query: authorizationDto,
      }),
      (req, res) => this.addWeightAndReps(req, res),
    );

    router.patch(
      '/workouts/:workoutId/exercises/:exerciseOrder/sets/:setOrder/complete',
      this.validator.validate({ params: markSetAsCompletedParamsDto, query: authorizationDto }),
      (req, res) => this.markSetAsCompleted(req, res),
    );

    router.patch(
      '/workouts/:workoutId/exercises/:exerciseOrder/sets/:setOrder/un-complete',
      this.validator.validate({ params: markSetAsUnCompletedParamsDto, query: authorizationDto }),
      (req, res) => this.markSetAsUncompleted(req, res),
    );

    router.patch(
      '/workouts/:workoutId/exercises/:exerciseOrder/complete',
      this.validator.validate({ params: markExerciseAsCompletedParamsDto, query: authorizationDto }),
      (req, res) => this.markExerciseAsCompleted(req, res),
    );

    router.patch(
      '/workouts/:workoutId/exercises/:exerciseOrder/un-complete',
      this.validator.validate({ params: markExerciseAsUnCompletedParamsDto, query: authorizationDto }),
      (req, res) => this.markExerciseAsUncompleted(req, res),
    );

    return router;
  }

  private async startWorkoutFromTemplate(
    request: Request<unknown, unknown, StartWorkoutFromTemplateBodyDto, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { workoutTemplateId } = request.body;
    const { userId } = request.query;
    const workout = await this.workoutService.startWorkoutFromTemplate(new Date(), userId, workoutTemplateId);
    response.status(201).json(workout);
  }

  private async startEmptyWorkout(
    request: Request<unknown, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { userId } = request.query;
    const workout = await this.workoutService.startEmptyWorkout(new Date(), userId);
    response.status(201).json(workout);
  }

  private async finishWorkout(
    request: Request<FinishWorkoutParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { workoutId } = request.params;
    const { userId } = request.query;
    await this.workoutService.finishWorkout(userId, workoutId, new Date());
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  private async getWorkout(
    request: Request<GetWorkoutParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { workoutId } = request.params;
    const { userId } = request.query;
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  private async addExercise(
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

  private async removeExercise(
    request: Request<RemoveExerciseParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { workoutId, exerciseOrder } = request.params;
    const { userId } = request.query;
    await this.workoutService.removeExercise(userId, workoutId, exerciseOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  private async addSet(
    request: Request<AddSetParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { workoutId, exerciseOrder } = request.params;
    const { userId } = request.query;
    await this.workoutService.addSet(userId, workoutId, exerciseOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(201).json(workout);
  }

  private async removeSet(
    request: Request<RemoveSetParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { workoutId, exerciseOrder, setOrder } = request.params;
    const { userId } = request.query;
    await this.workoutService.removeSet(userId, workoutId, exerciseOrder, setOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  private async addWeightAndReps(
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

  private async markSetAsCompleted(
    request: Request<MarkSetAsCompletedParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { userId } = request.query;
    const { workoutId, exerciseOrder, setOrder } = request.params;
    await this.workoutService.markSetAsCompleted(userId, workoutId, exerciseOrder, setOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  private async markSetAsUncompleted(
    request: Request<MarkSetAsUnCompletedParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { userId } = request.query;
    const { workoutId, exerciseOrder, setOrder } = request.params;
    await this.workoutService.markSetAsUnCompleted(userId, workoutId, exerciseOrder, setOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  private async markExerciseAsCompleted(
    request: Request<MarkExerciseAsCompletedParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response,
  ): Promise<void> {
    const { userId } = request.query;
    const { workoutId, exerciseOrder } = request.params;
    await this.workoutService.markExerciseAsCompleted(userId, workoutId, exerciseOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  private async markExerciseAsUncompleted(
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
