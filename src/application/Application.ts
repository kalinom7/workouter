import express, { type Application as EA, type NextFunction, type Request, type Response } from 'express';
import { injectable, multiInject, inject } from 'inversify';

import { Controller } from './controller/Controller.js';

import cors from 'cors';
import { HttpException, UnknownException } from './HttpException.js';
import { Server } from 'http';
import { MongoConnection } from './MongoConnection.js';
import { MongoConnectionId } from '../inversify.config.js';

@injectable()
export class Application {
  private readonly app: EA;
  private server: Server | undefined;

  constructor(
    @multiInject(Controller)
    private readonly controllers: Controller[],
    @inject(MongoConnectionId)
    private readonly mongoConnection: MongoConnection,
  ) {
    console.log('Initializing application...');
    this.app = express();
    this.app.use(cors());
    this.app.use(express.json());

    for (const controller of this.controllers) {
      this.app.use(controller.getRoutes());
    }
  }

  public getApp(): EA {
    return this.app;
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

    this.server = this.app.listen(3000, (error) => {
      if (error) {
        console.error('Error starting server:', error);

        return;
      }
      console.log('Server is running on port 3000');
    });
  }

  public async stop(): Promise<void> {
    console.log('Stopping application...');
    // Implement stop logic if needed
    this.server?.close();
    await this.mongoConnection.disconnect();
  }
}
