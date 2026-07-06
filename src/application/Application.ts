import express, { type Application as EA, type NextFunction, type Request, type Response } from 'express';
import { injectable, multiInject } from 'inversify';

import { Controller } from './controller/Controller.js';

import cors from 'cors';
import { HttpException, UnknownException } from './HttpException.js';

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
  }

  public async start(): Promise<void> {
    console.log('Starting application...');

    //GLOBAL

    //global error handler
    this.app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      console.error(err.stack);
      if (err instanceof HttpException) {
        res.status(err.status).json(err);
      } else {
        res.status(500).json(new UnknownException());
      }
    });

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
