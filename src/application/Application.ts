import express, { type Application as EA, type NextFunction, type Request, type Response } from 'express';
import { injectable } from 'inversify';
import { WorkoutController } from './controller/WorkoutController.js';
import { WorkoutTemplateController } from './controller/WorkoutTemplateController.js';
import { finishWorkoutDto, startWorkoutFromTemplateDto } from './dto/WorkoutControllerDto.js';
import {
  addWorkoutTemplateExerciseDto,
  createWorkoutTemplateDto,
  removeWorkoutTemplateExerciseDto,
} from './dto/WorkoutTemplateControllerDto.js';
import { Validator } from './validation/Validator.js';

@injectable()
export class Application {
  private readonly app: EA;

  constructor(
    private readonly workoutController: WorkoutController,
    private readonly validator: Validator,
    private readonly workoutTemplateController: WorkoutTemplateController,
  ) {
    this.app = express();
    this.app.use(express.json());
    //create workout template
    this.app.post('/workout-template', this.validator.getValidationMiddleware(createWorkoutTemplateDto), (req, res) =>
      this.workoutTemplateController.create(req, res),
    );
    //add exercise to workout template
    this.app.post(
      '/workout-template/exercise',
      this.validator.getValidationMiddleware(addWorkoutTemplateExerciseDto),
      (req, res) => this.workoutTemplateController.addWorkoutTemplateExercise(req, res),
    );
    //remove exercise from workout template
    this.app.delete(
      '/workout-template/exercise',
      this.validator.getValidationMiddleware(removeWorkoutTemplateExerciseDto),
      (req, res) => this.workoutTemplateController.removeWorkoutTemplateExercise(req, res),
    );
    //WORKOUT
    //start workout from template
    this.app.post('/workout', this.validator.getValidationMiddleware(startWorkoutFromTemplateDto), (req, res) =>
      this.workoutController.startWorkoutFromTemplate(req, res),
    );
    //finish workout
    this.app.post('/workout/finish', this.validator.getValidationMiddleware(finishWorkoutDto), (req, res) =>
      this.workoutController.finishWorkout(req, res),
    );
    //GLOBAL
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
