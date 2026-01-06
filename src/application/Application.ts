import express, { type Application as EA, type NextFunction, type Request, type Response } from 'express';
import { injectable, multiInject } from 'inversify';
import { WorkoutTemplateController } from './controller/WorkoutTemplateController.js';
import { authorizationDto } from './dto/AuthorizationDto.js';

import { Controller } from './controller/Controller.js';
import { ExerciseController } from './controller/ExerciseController.js';
import { WorkoutScheduleController } from './controller/WorkoutScheduleController.js';
import { createExerciseBodyDto, getExerciseParamsDto } from './dto/ExerciseControllerDto.js';
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
import cors from 'cors';
import { Validator } from './validation/Validator.js';

@injectable()
export class Application {
  private readonly app: EA;

  constructor(
    @multiInject(Controller)
    private readonly controllers: Controller[],
    private readonly validator: Validator,
    private readonly workoutTemplateController: WorkoutTemplateController,
    private readonly workoutScheduleController: WorkoutScheduleController,
    private readonly exerciseController: ExerciseController,
  ) {
    this.app = express();
    this.app.use(cors());
    this.app.use(express.json());

    for (const controller of this.controllers) {
      this.app.use(controller.getRoutes());
    }

    //GLOBAL
    //EXERCISE CONTROLLER ROUTES

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
