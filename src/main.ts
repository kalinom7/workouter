import { Application } from './application/Application.js';
import 'reflect-metadata';

try {
  await Application.start();
  console.log('Application started successfully.');
} catch (error) {
  console.error('Failed to start application:', error);
}
