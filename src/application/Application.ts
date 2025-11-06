import express, { type Application as EA } from 'express';

import { WorkoutController } from './WorkoutController.js';
import { WorkoutService } from '../domain/workout/WorkoutService.js';
import { WorkoutTemplateService } from '../domain/workouttemplate/WorkoutTemplateService.js';
export class Application {
  private app: EA;

  private constructor(private readonly workoutController: WorkoutController) {
    this.app = express();
    this.app.post('/workout', (req, res) => this.workoutController.start(req, res));
  }

  public static async start(): Promise<Application> {
    return new Application(
      new WorkoutController(new WorkoutService(new InMemoryWorkoutRepository(), new WorkoutTemplateService(new In()))),
    ); // Replace with actual repository
  }

  public stop(): void {
    // Implement stop logic if needed
  }
}
