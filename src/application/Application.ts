import express, { type Application as EA, type NextFunction, type Request, type Response } from 'express';
import { injectable } from 'inversify';
import { WorkoutController } from './controller/WorkoutController.js';
import { WorkoutTemplateController } from './controller/WorkoutTemplateController.js';
import { authorizationDto } from './dto/AuthorizationDto.js';

import { Validator } from './validation/Validator.js';
import { WorkoutScheduleController } from './controller/WorkoutScheduleController.js';
import { createExerciseBodyDto, getExerciseParamsDto } from './dto/ExerciseControllerDto.js';
import { ExerciseController } from './controller/ExerciseController.js';
import {
  addWorkoutTemplateExerciseBodyDto,
  addWorkoutTemplateExerciseParamsDto,
  createWorkoutTemplateBodyDto,
  deleteWorkoutTemplateParamsDto,
  getWorkoutTemplateParamsDto,
  removeWorkoutTemplateExerciseBodyDto,
  removeWorkoutTemplateExerciseParamsDto,
  setNumberOfSetsBodyDto,
  setNumberOfSetsParamsDto,
  setRestPeriodBodyDto,
  setRestPeriodParamsDto,
} from './dto/WorkoutTemplateControllerDto.js';
import {
  addRestToBlockBodyDto,
  addRestToBlockParamsDto,
  addWorkoutToBlockBodyDto,
  addWorkoutToBlockParamsDto,
  createWorkoutScheduleBodyDto,
  deleteWorkoutScheduleParamsDto,
  getWorkoutScheduleParamsDto,
  removeBlockItemBodyDto,
  removeBlockItemParamsDto,
  setWorkoutScheduleActiveParamsDto,
  setWorkoutScheduleInactiveParamsDto,
} from './dto/WorkoutScheduleControllerDto.js';
import {
  addExerciseBodyDto,
  addExerciseParamsDto,
  finishWorkoutParamsDto,
  startWorkoutFromTemplateBodyDto,
  removeExerciseParamsDto,
  addSetParamsDto,
  removeSetParamsDto,
  addWeightAndRepsBodyDto,
  addWeightAndRepsParamsDto,
  markSetAsCompletedParamsDto,
  markSetAsUnCompletedParamsDto,
  MarkExerciseAsCompletedParamsDto,
  MarkExerciseAsUnCompletedParamsDto,
} from './dto/WorkoutControllerDto.js';

@injectable()
export class Application {
  private readonly app: EA;

  constructor(
    private readonly workoutController: WorkoutController,
    private readonly validator: Validator,
    private readonly workoutTemplateController: WorkoutTemplateController,
    private readonly workoutScheduleController: WorkoutScheduleController,
    private readonly exerciseController: ExerciseController,
  ) {
    this.app = express();
    this.app.use(express.json());

    //GLOBAL
    //EXERCISE CONTROLLER ROUTES
    this.app.post(
      '/exercises',
      this.validator.validate({ body: createExerciseBodyDto, query: authorizationDto }),
      (req, res) => this.exerciseController.create(req, res),
    );
    this.app.get(
      '/exercises/:exerciseId',
      this.validator.validate({ params: getExerciseParamsDto, query: authorizationDto }),
      (req, res) => this.exerciseController.get(req, res),
    );
    this.app.patch(
      '/exercises/:exerciseId',
      this.validator.validate({
        params: getExerciseParamsDto,
        body: createExerciseBodyDto,
        query: authorizationDto,
      }),
      (req, res) => this.exerciseController.update(req, res),
    );
    this.app.delete(
      '/exercises/:exerciseId',
      this.validator.validate({ params: getExerciseParamsDto, query: authorizationDto }),
      (req, res) => this.exerciseController.delete(req, res),
    );

    //WORKOUT TEMPLATE CONTOLLER ROUTERS

    this.app.post(
      '/workout-templates',
      this.validator.validate({ body: createWorkoutTemplateBodyDto, query: authorizationDto }),
      (req, res) => this.workoutTemplateController.create(req, res),
    );
    this.app.post(
      '/workout-templates/:workoutTemplateId/exercises',
      this.validator.validate({
        params: addWorkoutTemplateExerciseParamsDto,
        body: addWorkoutTemplateExerciseBodyDto,
        query: authorizationDto,
      }),
      (req, res) => this.workoutTemplateController.addWorkoutTemplateExercise(req, res),
    );

    this.app.delete(
      '/workout-templates/:workoutTemplateId/exercises',
      this.validator.validate({
        params: removeWorkoutTemplateExerciseParamsDto,
        body: removeWorkoutTemplateExerciseBodyDto,
        query: authorizationDto,
      }),
      (req, res) => this.workoutTemplateController.removeWorkoutTemplateExercise(req, res),
    );

    this.app.patch(
      '/workout-templates/:workoutTemplateId/exercises/:order/sets',
      this.validator.validate({
        params: setNumberOfSetsParamsDto,
        body: setNumberOfSetsBodyDto,
        query: authorizationDto,
      }),
      (req, res) => this.workoutTemplateController.setNumberOfSets(req, res),
    );

    this.app.patch(
      '/workout-templates/:workoutTemplateId/exercises/:order/rest-period',
      this.validator.validate({
        params: setRestPeriodParamsDto,
        body: setRestPeriodBodyDto,
        query: authorizationDto,
      }),
      (req, res) => this.workoutTemplateController.setRestPeriod(req, res),
    );

    this.app.get(
      '/workout-templates/:workoutTemplateId',
      this.validator.validate({ params: getWorkoutTemplateParamsDto, query: authorizationDto }),
      (req, res) => this.workoutTemplateController.getWorkoutTemplate(req, res),
    );

    this.app.delete(
      '/workout-templates/:workoutTemplateId',
      this.validator.validate({ params: deleteWorkoutTemplateParamsDto, query: authorizationDto }),
      (req, res) => this.workoutTemplateController.deleteWorkoutTemplate(req, res),
    );

    //WORKOUT SCHEDULE CONTROLLER ROUTES

    this.app.post(
      '/workout-schedules',
      this.validator.validate({ body: createWorkoutScheduleBodyDto, query: authorizationDto }),
      (req, res) => this.workoutScheduleController.createWorkoutSchedule(req, res),
    );

    this.app.get(
      '/workout-schedules/:workoutScheduleId',
      this.validator.validate({ params: getWorkoutScheduleParamsDto, query: authorizationDto }),
      (req, res) => this.workoutScheduleController.getWorkoutSchedule(req, res),
    );

    this.app.delete(
      '/workout-schedules/:workoutScheduleId',
      this.validator.validate({ params: deleteWorkoutScheduleParamsDto, query: authorizationDto }),
      (req, res) => this.workoutScheduleController.deleteWorkoutSchedule(req, res),
    );

    this.app.post(
      '/workout-schedules/:workoutScheduleId/block/workout',
      this.validator.validate({
        params: addWorkoutToBlockParamsDto,
        body: addWorkoutToBlockBodyDto,
        query: authorizationDto,
      }),
      (req, res) => this.workoutScheduleController.addWorkoutToBlock(req, res),
    );

    this.app.post(
      '/workout-schedules/:workoutScheduleId/block/rest',
      this.validator.validate({
        params: addRestToBlockParamsDto,
        body: addRestToBlockBodyDto,
        query: authorizationDto,
      }),
      (req, res) => this.workoutScheduleController.addRestToBlock(req, res),
    );

    this.app.delete(
      '/workout-schedules/:workoutScheduleId/block/:blockItemId',
      this.validator.validate({
        params: removeBlockItemParamsDto,
        body: removeBlockItemBodyDto,
        query: authorizationDto,
      }),
      (req, res) => this.workoutScheduleController.removeBlockItem(req, res),
    );

    this.app.patch(
      '/workout-schedules/:workoutScheduleId/activate',
      this.validator.validate({ params: setWorkoutScheduleActiveParamsDto, query: authorizationDto }),
      (req, res) => this.workoutScheduleController.setWorkoutScheduleActive(req, res),
    );

    this.app.patch(
      '/workout-schedules/:workoutScheduleId/deactivate',
      this.validator.validate({ params: setWorkoutScheduleInactiveParamsDto, query: authorizationDto }),
      (req, res) => this.workoutScheduleController.setWorkoutScheduleInActive(req, res),
    );

    //WORKOUT CONTROLLER
    this.app.post(
      '/workouts/from-template',
      this.validator.validate({ body: startWorkoutFromTemplateBodyDto, query: authorizationDto }),
      (req, res) => this.workoutController.startWorkoutFromTemplate(req, res),
    );

    this.app.post('/workouts/empty', this.validator.validate({ query: authorizationDto }), (req, res) =>
      this.workoutController.startEmptyWorkout(req, res),
    );

    this.app.patch(
      '/workouts/:workoutId/finish',
      this.validator.validate({ params: finishWorkoutParamsDto, query: authorizationDto }),
      (req, res) => this.workoutController.finishWorkout(req, res),
    );

    this.app.post(
      '/workouts/:workoutId/exercises',
      this.validator.validate({ body: addExerciseBodyDto, params: addExerciseParamsDto, query: authorizationDto }),
      (req, res) => this.workoutController.addExercise(req, res),
    );

    this.app.delete(
      '/workouts/:workoutId/exercises/:exerciseOrder',
      this.validator.validate({ params: removeExerciseParamsDto, query: authorizationDto }),
      (req, res) => this.workoutController.removeExercise(req, res),
    );

    this.app.post(
      '/workouts/:workoutId/exercises/:exerciseOrder/sets',
      this.validator.validate({ params: addSetParamsDto, query: authorizationDto }),
      (req, res) => this.workoutController.addSet(req, res),
    );

    this.app.delete(
      '/workouts/:workoutId/exercises/:exerciseOrder/sets/:setOrder',
      this.validator.validate({ params: removeSetParamsDto, query: authorizationDto }),
      (req, res) => this.workoutController.removeSet(req, res),
    );

    this.app.patch(
      '/workouts/:workoutId/exercises/:exerciseOrder/sets/:setOrder/weight-and-reps',
      this.validator.validate({
        body: addWeightAndRepsBodyDto,
        params: addWeightAndRepsParamsDto,
        query: authorizationDto,
      }),
      (req, res) => this.workoutController.addWeightAndReps(req, res),
    );

    this.app.patch(
      '/workouts/:workoutId/exercises/:exerciseOrder/sets/:setOrder/complete',
      this.validator.validate({ params: markSetAsCompletedParamsDto, query: authorizationDto }),
      (req, res) => this.workoutController.markSetAsCompleted(req, res),
    );

    this.app.patch(
      '/workouts/:workoutId/exercises/:exerciseOrder/sets/:setOrder/un-complete',
      this.validator.validate({ params: markSetAsUnCompletedParamsDto, query: authorizationDto }),
      (req, res) => this.workoutController.markSetAsUncompleted(req, res),
    );

    this.app.patch(
      '/workouts/:workoutId/exercises/:exerciseOrder/complete',
      this.validator.validate({ params: MarkExerciseAsCompletedParamsDto, query: authorizationDto }),
      (req, res) => this.workoutController.markExerciseAsCompleted(req, res),
    );

    this.app.patch(
      '/workouts/:workoutId/exercises/:exerciseOrder/un-complete',
      this.validator.validate({ params: MarkExerciseAsUnCompletedParamsDto, query: authorizationDto }),
      (req, res) => this.workoutController.markExerciseAsUncompleted(req, res),
    );

    //global error handler

    this.app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      console.error(err.stack);
      res.status(500).json({ error: err.name, message: err.message });
    });
    this.app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  }

  public async start(): Promise<void> {
    console.log('Starting application...');
  }

  public stop(): void {
    console.log('Stopping application...');
    // Implement stop logic if needed
  }
}
