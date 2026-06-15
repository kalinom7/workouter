import express, { type Application as EA } from 'express';
import { injectable, multiInject } from 'inversify';

import { Controller } from './controller/Controller.js';

import cors from 'cors';
import { errorHandler } from './errorHandler/errorHandler.js';

@injectable()
export class Application {
  private readonly app: EA;

  constructor(
    @multiInject(Controller)
    private readonly controllers: Controller[],
  ) {
    this.app = express();
    this.app.use(cors());
    this.app.use(express.json());
    for (const controller of this.controllers) {
      this.app.use(controller.getRoutes());
    }
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    console.log('Starting application...');
    this.app.listen(3000, (error) => {
      if (error) {
        console.error('Error starting server:', error);

        return;
      }
      console.log('Server is running on port 3000');
    });
  }

  public stop(): void {
    console.log('Stopping application...');
    // Implement stop logic if needed
  }
}
