import express, { type NextFunction, type Application as EA, type Response, type Request } from 'express';
import { Validator } from './validation/Validator.js';
import { startWorkoutDto, WorkoutController } from './WorkoutController.js';
import { WorkoutService } from '../domain/workout/WorkoutService.js';
import { InMemoWorkoutRepository } from '../domain/workout/WorkoutRepository.js';
import { WorkoutTemplateService } from '../domain/workouttemplate/WorkoutTemplateService.js';
import { InMemoWorkoutTemplateRepository } from '../domain/workouttemplate/WorkoutTemplateRepository.js';
import { ExerciseService } from '../domain/exercise/ExerciseService.js';
import { InMemoExerciseRepository } from '../domain/exercise/ExerciseRepository.js';

export class Application {
  private app: EA;

  private constructor(
    private readonly workoutController: WorkoutController,
    private readonly validator: Validator,
  ) {
    this.app = express();
    this.app.use(express.json());
    this.app.post('/workout', this.validator.getValidationMiddleware(startWorkoutDto), (req, res) =>
      this.workoutController.start(req, res),
    );
    this.app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      console.error(err.stack);
      res.status(500).json({ error: err.name, message: err.message });
    });
    this.app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  }

  public static async start(): Promise<void> {
    console.log('Starting application...');

    new Application(
      new WorkoutController(
        new WorkoutService(
          new InMemoWorkoutRepository(),
          new WorkoutTemplateService(new InMemoWorkoutTemplateRepository()),
          new ExerciseService(new InMemoExerciseRepository()),
        ),
      ),
      new Validator(),
    ); // Replace with actual repository
  }

  public stop(): void {
    // Implement stop logic if needed
  }
}
