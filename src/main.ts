import 'reflect-metadata';
import { Application } from './application/Application.js';
import { container } from './inversify.config.js';

try {
  const app = container.get(Application);
  await app.start();
  console.log('Application started successfully.');
} catch (error) {
  console.error('Failed to start application:', error);
}
