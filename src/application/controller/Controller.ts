import { type Router } from 'express';

export abstract class Controller {
  public abstract getRoutes(): Router;
}
