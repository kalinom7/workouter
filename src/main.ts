import { Application } from './application/Application.js';

try {
  await Application.start();
  console.log('Application started successfully.');
} catch (error) {
  console.error('Failed to start application:', error);
}
