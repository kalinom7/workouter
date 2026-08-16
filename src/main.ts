import 'reflect-metadata';
import { Application } from './application/Application.js';
import { container, MongoConnectionId } from './inversify.config.js';

try {
  const useMongoDb = typeof process.env['MONGO_URL'] === 'string' && process.env['MONGO_URL'].length > 0;

  if (useMongoDb) {
    await container.getAsync(MongoConnectionId);
    console.log('Connected to MongoDB');
  } else {
    console.log('Using in-memory repositories');
  }

  const app = await container.getAsync(Application);
  await app.start();
  console.log('Application started successfully.');
} catch (error) {
  console.error('Failed to start application:', error);
}
