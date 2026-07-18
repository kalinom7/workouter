import { Container } from 'inversify';
import { Db } from 'mongodb';
import { Validator } from './application/validation/Validator.js';
import { ExerciseRepository } from './domain/exercise/ExerciseRepository.js';
import { WorkoutRepository } from './domain/workout/WorkoutRepository.js';
import { WorkoutTemplateRepository } from './domain/workouttemplate/WorkoutTemplateRepository.js';
import { WorkoutScheduleRepository } from './domain/workoutschedule/WorkoutScheduleRepository.js';
import { WorkoutController } from './application/controller/WorkoutController.js';
import { Controller } from './application/controller/Controller.js';
import { ExerciseController } from './application/controller/ExerciseController.js';
import { WorkoutTemplateController } from './application/controller/WorkoutTemplateController.js';
import { WorkoutScheduleController } from './application/controller/WorkoutScheduleController.js';
import { MongoConnection } from './application/MongoConnection.js';
import { MongoExerciseRepository } from './application/repository/Exercise/MongoExerciseRepository.js';
import { MongoWorkoutRepository } from './application/repository/Workout/MongoWorkoutRepository.js';
import { MongoWorkoutTemplateRepository } from './application/repository/WorkoutTemplate/MongoWorkoutTemplateRepository.js';
import { MongoWorkoutScheduleRepository } from './application/repository/WorkoutSchedule/MongoWorkoutScheduleRepository.js';
import { InMemoExerciseRepository } from './application/repository/Exercise/InMemoExerciseRepository.js';
import { InMemoWorkoutRepository } from './application/repository/Workout/InMemoWorkoutRepository.js';
import { InMemoWorkoutTemplateRepository } from './application/repository/WorkoutTemplate/InMemoWorkoutTemplateRepository.js';
import { InMemoWorkoutScheduleRepository } from './application/repository/WorkoutSchedule/InMemoWorkoutScheduleRepository.js';

const container = new Container({
  autobind: true,
});

// Controllers
container.bind(Controller).to(WorkoutController);
container.bind(Controller).to(ExerciseController);
container.bind(Controller).to(WorkoutTemplateController);
container.bind(Controller).to(WorkoutScheduleController);

// MongoConnection singleton
/**
 * possible to solve also with const mongoConnection and then bind constant value
 */
container
  .bind(MongoConnection)
  .toDynamicValue(async (_context) => {
    return MongoConnection.create();
  })
  .inSingletonScope()
  .onDeactivation(async (mongoConnection) => {
    await mongoConnection.disconnect();
  });

// Bind Db from MongoConnection
container
  .bind(Db)
  .toDynamicValue(async (context) => {
    const mongoConnection = await context.getAsync(MongoConnection);

    return mongoConnection.getDb();
  })
  .inSingletonScope();

// Validator
container.bind(Validator).to(Validator);

const useMongoDb = typeof process.env['MONGO_URL'] === 'string' && process.env['MONGO_URL'].length > 0;

if (useMongoDb) {
  // Use MongoDB repositories
  container.bind(ExerciseRepository).to(MongoExerciseRepository).inSingletonScope();
  container.bind(WorkoutRepository).to(MongoWorkoutRepository).inSingletonScope();
  container.bind(WorkoutTemplateRepository).to(MongoWorkoutTemplateRepository).inSingletonScope();
  container.bind(WorkoutScheduleRepository).to(MongoWorkoutScheduleRepository).inSingletonScope();
} else {
  // Use in-memory repositories
  container.bind(ExerciseRepository).to(InMemoExerciseRepository).inSingletonScope();
  container.bind(WorkoutRepository).to(InMemoWorkoutRepository).inSingletonScope();
  container.bind(WorkoutTemplateRepository).to(InMemoWorkoutTemplateRepository).inSingletonScope();
  container.bind(WorkoutScheduleRepository).to(InMemoWorkoutScheduleRepository).inSingletonScope();
}

export { container };
