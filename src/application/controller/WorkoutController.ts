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
  FinishWorkoutParamsDto,
  finishWorkoutParamsDto,
  getWorkoutParamsDto,
  GetWorkoutParamsDto,
  MarkSetAsUnCompletedParamsDto,
  markSetAsUnCompletedParamsDto,
  RemoveExerciseParamsDto,
  removeExerciseParamsDto,
  RemoveSetParamsDto,
  removeSetParamsDto,
  SaveSetBodyDto,
  saveSetBodyDto,
  SaveSetParamsDto,
  saveSetParamsDto,
  setRestPeriodBodyDto,
  SetRestPeriodBodyDto,
  setRestPeriodParamsDto,
  SetRestPeriodParamsDto,
  StartWorkoutFromTemplateBodyDto,
  startWorkoutFromTemplateBodyDto,
} from '../dto/WorkoutControllerDto.js';
import { ParsedData, Validator } from '../validation/Validator.js';
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
      '/workouts/start/from-template',
      this.validator.validate({ body: startWorkoutFromTemplateBodyDto, query: authorizationDto }),
      (req, res) => this.startWorkoutFromTemplate(req, res),
    );

    router.post('/workouts/start/empty', this.validator.validate({ query: authorizationDto }), (req, res) =>
      this.startEmptyWorkout(req, res),
    );

    router.get(
      '/workouts/:workoutId',
      this.validator.validate({ params: getWorkoutParamsDto, query: authorizationDto }),
      (req, res) => this.getWorkout(req, res),
    );

    router.get('/workouts', this.validator.validate({ query: authorizationDto }), (req, res) =>
      this.getAllWorkouts(req, res),
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
      '/workouts/:workoutId/exercises/:exerciseOrder/sets/:setOrder',
      this.validator.validate({
        body: saveSetBodyDto,
        params: saveSetParamsDto,
        query: authorizationDto,
      }),
      (req, res) => this.saveSet(req, res),
    );

    router.patch(
      '/workouts/:workoutId/exercises/:exerciseOrder/sets/:setOrder/uncomplete',
      this.validator.validate({ params: markSetAsUnCompletedParamsDto, query: authorizationDto }),
      (req, res) => this.markSetAsUncompleted(req, res),
    );

    router.patch(
      '/workouts/:workoutId/exercises/:exerciseOrder/setRestPeriod',
      this.validator.validate({ body: setRestPeriodBodyDto, params: setRestPeriodParamsDto, query: authorizationDto }),
      (req, res) => this.setRestPeriod(req, res),
    );

    return router;
  }

  private async startWorkoutFromTemplate(
    _request: Request<unknown, unknown, StartWorkoutFromTemplateBodyDto, AuthorizationDto>,
    response: Response<unknown, ParsedData<unknown, StartWorkoutFromTemplateBodyDto, AuthorizationDto>>,
  ): Promise<void> {
    const { workoutTemplateId } = response.locals.body;
    const { userId } = response.locals.query;
    const workout = await this.workoutService.startWorkoutFromTemplate(new Date(), userId, workoutTemplateId);
    response.status(201).json(workout);
  }

  private async startEmptyWorkout(
    _request: Request<unknown, unknown, unknown, AuthorizationDto>,
    response: Response<unknown, ParsedData<unknown, unknown, AuthorizationDto>>,
  ): Promise<void> {
    const { userId } = response.locals.query;
    const workout = await this.workoutService.startEmptyWorkout(new Date(), userId);
    response.status(201).json(workout);
  }

  private async finishWorkout(
    _request: Request<FinishWorkoutParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response<unknown, ParsedData<FinishWorkoutParamsDto, unknown, AuthorizationDto>>,
  ): Promise<void> {
    const { workoutId } = response.locals.params;
    const { userId } = response.locals.query;
    await this.workoutService.finishWorkout(userId, workoutId, new Date());
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  private async getWorkout(
    _request: Request<GetWorkoutParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response<unknown, ParsedData<GetWorkoutParamsDto, unknown, AuthorizationDto>>,
  ): Promise<void> {
    const { workoutId } = response.locals.params;
    const { userId } = response.locals.query;
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  private async getAllWorkouts(
    _request: Request<unknown, unknown, unknown, AuthorizationDto>,
    response: Response<unknown, ParsedData<unknown, unknown, AuthorizationDto>>,
  ): Promise<void> {
    const { userId } = response.locals.query;

    const workouts = await this.workoutService.getAllWorkouts(userId);
    response.status(200).json(workouts);
  }

  private async addExercise(
    _request: Request<AddExerciseParamsDto, unknown, AddExerciseBodyDto, AuthorizationDto>,
    response: Response<unknown, ParsedData<AddExerciseParamsDto, AddExerciseBodyDto, AuthorizationDto>>,
  ): Promise<void> {
    const { exerciseId } = response.locals.body;
    const { userId } = response.locals.query;
    const { workoutId } = response.locals.params;
    await this.workoutService.addExercise(userId, workoutId, exerciseId);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(201).json(workout);
  }

  private async removeExercise(
    _request: Request<RemoveExerciseParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response<unknown, ParsedData<RemoveExerciseParamsDto, unknown, AuthorizationDto>>,
  ): Promise<void> {
    const { workoutId, exerciseOrder } = response.locals.params;
    const { userId } = response.locals.query;
    await this.workoutService.removeExercise(userId, workoutId, exerciseOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  private async addSet(
    _request: Request<AddSetParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response<unknown, ParsedData<AddSetParamsDto, unknown, AuthorizationDto>>,
  ): Promise<void> {
    const { workoutId, exerciseOrder } = response.locals.params;
    const { userId } = response.locals.query;
    await this.workoutService.addSet(userId, workoutId, exerciseOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(201).json(workout);
  }

  private async removeSet(
    _request: Request<RemoveSetParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response<unknown, ParsedData<RemoveSetParamsDto, unknown, AuthorizationDto>>,
  ): Promise<void> {
    const { workoutId, exerciseOrder, setOrder } = response.locals.params;
    const { userId } = response.locals.query;
    await this.workoutService.removeSet(userId, workoutId, exerciseOrder, setOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  private async saveSet(
    _request: Request<SaveSetParamsDto, unknown, SaveSetBodyDto, AuthorizationDto>,
    response: Response<unknown, ParsedData<SaveSetParamsDto, SaveSetBodyDto, AuthorizationDto>>,
  ): Promise<void> {
    const { weight, reps } = response.locals.body;
    const { userId } = response.locals.query;
    const { workoutId, exerciseOrder, setOrder } = response.locals.params;
    await this.workoutService.saveSet(userId, workoutId, exerciseOrder, setOrder, weight, reps);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  private async markSetAsUncompleted(
    _request: Request<MarkSetAsUnCompletedParamsDto, unknown, unknown, AuthorizationDto>,
    response: Response<unknown, ParsedData<MarkSetAsUnCompletedParamsDto, unknown, AuthorizationDto>>,
  ): Promise<void> {
    const { userId } = response.locals.query;
    const { workoutId, exerciseOrder, setOrder } = response.locals.params;
    await this.workoutService.markSetAsUnCompleted(userId, workoutId, exerciseOrder, setOrder);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }

  private async setRestPeriod(
    _request: Request<SetRestPeriodParamsDto, unknown, SetRestPeriodBodyDto, AuthorizationDto>,
    response: Response<unknown, ParsedData<SetRestPeriodParamsDto, SetRestPeriodBodyDto, AuthorizationDto>>,
  ): Promise<void> {
    const { userId } = response.locals.query;
    const { workoutId, exerciseOrder } = response.locals.params;
    const { restPeriod } = response.locals.body;
    await this.workoutService.setRestPeriod(workoutId, exerciseOrder, restPeriod, userId);
    const workout = await this.workoutService.getWorkout(workoutId, userId);
    response.status(200).json(workout);
  }
}
