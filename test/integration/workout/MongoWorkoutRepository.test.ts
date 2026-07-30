import {} from '@golevelup/ts-jest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoConnection } from '../../../src/application/MongoConnection';
import {
  type MongoWorkout,
  MongoWorkoutRepository,
} from '../../../src/application/repository/Workout/MongoWorkoutRepository';
import process from 'process';
import { type Collection } from 'mongodb';
import { type Workout } from '../../../src/domain/workout/model/Workout';
import { randomUUID } from 'crypto';

describe('MongoWorkoutRepository', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: MongoConnection;
  let repository: MongoWorkoutRepository;
  let collection: Collection<MongoWorkout>;
  const originalUrl = process.env['MONGO_URL'];
  const originalDb = process.env['MONGO_DATABASE'];

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env['MONGO_URL'] = mongod.getUri();
    process.env['MONGO_DATABASE'] = 'test-workout-repository';
    mongoConnection = await MongoConnection.create();
  });
  afterAll(async () => {
    await mongoConnection.disconnect();
    await mongod.stop();
    process.env['MONGO_URL'] = originalUrl;
    process.env['MONGO_DATABASE'] = originalDb;
  });
  beforeEach(async () => {
    collection = mongoConnection.getDb().collection<MongoWorkout>('workouts');
    await collection.deleteMany({});
    repository = new MongoWorkoutRepository(mongoConnection.getDb());
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
    const { id, ...workoutData } = workout;
    //when
    await repository.save(workout);

    //then
    const savedWorkout = await collection.findOne({ _id: workoutId, userId });
    expect(savedWorkout).toEqual({ _id: workoutId, ...workoutData });
  });
  test('should get existing workout', async () => {
    //given
    const workoutId = randomUUID();
    const userId = randomUUID();
    const workout: MongoWorkout = {
      _id: workoutId,
      userId: userId,
      usedWorkoutTemplate: randomUUID(),
      startTime: new Date('2026-07-11T10:30:00'),
      endTime: null,
      exercises: [],
    };
    const { _id, ...workoutData } = workout;
    await collection.insertOne({ ...workout });
    //when
    const returnedWorkout = await repository.get(workoutId, userId);

    //then
    expect(returnedWorkout).toEqual({ id: workoutId, ...workoutData });
  });
  test('should get all finished workouts', async () => {
    //given
    const userId = randomUUID();
    const workout1: MongoWorkout = {
      _id: randomUUID(),
      userId: userId,
      usedWorkoutTemplate: randomUUID(),
      startTime: new Date('2026-07-11T10:30:00'),
      endTime: null,
      exercises: [],
    };
    const workout2: MongoWorkout = {
      _id: randomUUID(),
      userId: userId,
      usedWorkoutTemplate: randomUUID(),
      startTime: new Date('2026-07-11T10:30:00'),
      endTime: null,
      exercises: [],
    };
    const workout3: MongoWorkout = {
      _id: randomUUID(),
      userId: userId,
      usedWorkoutTemplate: randomUUID(),
      startTime: new Date('2026-07-11T10:30:00'),
      endTime: null,
      exercises: [],
    };
    const workouts: MongoWorkout[] = [workout1, workout2, workout3];
    await collection.insertMany(workouts.map((workout) => ({ ...workout })));
    //when
    const returnedWorkouts = await repository.getAllFinished(userId);

    //then
    expect(returnedWorkouts).toEqual(workouts.map(({ _id, ...workoutData }) => ({ id: _id, ...workoutData })));
  });
});
