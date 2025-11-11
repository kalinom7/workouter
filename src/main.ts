import { Application } from './application/Application.js';
import 'reflect-metadata';
import { container } from './inversify.config.js';
import { TYPES } from './types.js';

container.bind<Application>(TYPES.Application).to(Application);

try {
  const app = container.get<Application>(TYPES.Application);
  await app.start();
  console.log('Application started successfully.');
} catch (error) {
  console.error('Failed to start application:', error);
}
