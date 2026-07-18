import 'reflect-metadata';
import { Application } from './application/Application.js';
import { container } from './inversify.config.js';
import { MongoConnection } from './application/MongoConnection.js';

try {
  const useMongoDb = typeof process.env['MONGO_URL'] === 'string' && process.env['MONGO_URL'].length > 0;

  if (useMongoDb) {
    await container.getAsync(MongoConnection);
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
