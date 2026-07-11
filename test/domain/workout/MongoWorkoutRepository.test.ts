import {} from '@golevelup/ts-jest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoConnection } from '../../../src/application/MongoConnection';
import { MongoWorkoutRepository } from '../../../src/domain/workout/WorkoutRepository';
import process from 'process';
import { type Collection } from 'mongodb';
import { type Workout } from '../../../src/domain/workout/model/Workout';
import { randomUUID } from 'crypto';

describe('MongoWorkoutRepository', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: MongoConnection;
  let repository: MongoWorkoutRepository;
  let collection: Collection<Workout>;
  const originalUrl = process.env['MONGO_URL'];
  const originalDb = process.env['MONGO_DATABASE'];

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    mongoConnection = new MongoConnection();
    process.env['MONGO_URL'] = mongod.getUri();
    process.env['MONGO_DATABASE'] = 'test-workout-repository';
    await mongoConnection.connect();
  });
  afterAll(async () => {
    await mongoConnection.disconnect();
    await mongod.stop();
    process.env['MONGO_URL'] = originalUrl;
    process.env['MONGO_DATABASE'] = originalDb;
  });
  beforeEach(async () => {
    collection = mongoConnection.getDb().collection<Workout>('workouts');
    await collection.deleteMany({});
    repository = new MongoWorkoutRepository(mongoConnection);
  });

  test('should save workout', async () => {
    //given
    const workoutId = randomUUID();
    const userId = randomUUID();
    const workout: Workout = {
      id: workoutId,
      userId: userId,
      usedWorkoutTemplate: randomUUID(),
      startTime: new Date('2026-07-11T10:30:00'),
      endTime: new Date(),
      exercises: [],
    };

    //when
    await repository.save(workout);

    //then
    const savedWorkout = await collection.findOne(workout, { projection: { _id: 0 } });
    expect(savedWorkout).toEqual(workout);
  });
  test('should get existing workout', async () => {
    //given
    const workoutId = randomUUID();
    const userId = randomUUID();
    const workout: Workout = {
      id: workoutId,
      userId: userId,
      usedWorkoutTemplate: randomUUID(),
      startTime: new Date('2026-07-11T10:30:00'),
      endTime: null,
      exercises: [],
    };
    await collection.insertOne({ ...workout });
    //when
    const returnedWorkout = await repository.get(workoutId, userId);

    //then
    expect(returnedWorkout).toEqual(workout);
  });
  test('should get all finished workouts', async () => {
    //given
    const userId = randomUUID();
    const workout1: Workout = {
      id: randomUUID(),
      userId: userId,
      usedWorkoutTemplate: randomUUID(),
      startTime: new Date('2026-07-11T10:30:00'),
      endTime: null,
      exercises: [],
    };
    const workout2: Workout = {
      id: randomUUID(),
      userId: userId,
      usedWorkoutTemplate: randomUUID(),
      startTime: new Date('2026-07-11T10:30:00'),
      endTime: null,
      exercises: [],
    };
    const workout3: Workout = {
      id: randomUUID(),
      userId: userId,
      usedWorkoutTemplate: randomUUID(),
      startTime: new Date('2026-07-11T10:30:00'),
      endTime: null,
      exercises: [],
    };
    const workouts: Workout[] = [workout1, workout2, workout3];
    await collection.insertMany(workouts.map((workout) => ({ ...workout })));
    //when
    const returnedWorkouts = await repository.getAllFinished(userId);

    //then
    expect(returnedWorkouts).toEqual(workouts);
  });
});
