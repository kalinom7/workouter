import express, { type NextFunction, type Application as EA, type Response, type Request } from 'express';
import { type Validator } from './validation/Validator.js';
import { startWorkoutDto, type WorkoutController } from './WorkoutController.js';
import { container } from '../inversify.config.js';
import { TYPES } from '../types.js';

export class Application {
  private readonly app: EA;

  constructor(
    private readonly workoutController: WorkoutController,
    private readonly validator: Validator,
  ) {
    this.app = express();
    this.app.use(express.json());

    this.app.get('/', (_req, res) => {
      res.send('Hello wssorld');
    });

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
    const workoutController = container.get<WorkoutController>(TYPES.WorkoutController);
    const validator = container.get<Validator>(TYPES.Validator);
    new Application(workoutController, validator);
  }

  public stop(): void {
    // Implement stop logic if needed
  }
}
