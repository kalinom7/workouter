import express, { type Application as EA, type NextFunction, type Request, type Response } from 'express';
import { injectable, multiInject } from 'inversify';

import { Controller } from './controller/Controller.js';

import cors from 'cors';

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
