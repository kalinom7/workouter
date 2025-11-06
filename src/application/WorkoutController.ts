import { type WorkoutService } from '../domain/workout/WorkoutService.js';
import { type Request, type Response } from 'express';
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  public async start(request: Request, response: Response): Promise<void> {
    const { userId, workoutTemplateId } = request.body;
    const workout = await this.workoutService.startWorkoutFromTemplate(new Date(), userId, workoutTemplateId);
    response.status(201).json(workout);
  }
}
