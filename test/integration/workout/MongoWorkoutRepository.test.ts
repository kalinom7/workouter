import { createMock, type DeepMocked } from '@golevelup/ts-jest';
import { MongoConnection } from '../../../src/application/MongoConnection';
import {
  MongoWorkoutRepository,
  type MongoWorkout,
} from '../../../src/application/repository/Workout/MongoWorkoutRepository';
import { type Collection } from 'mongodb';
import { type Workout } from '../../../src/domain/workout/model/Workout';
import { randomUUID } from 'crypto';
import { type Config } from '../../../src/application/config/Config';
import { MongoDBContainer, type StartedMongoDBContainer } from '@testcontainers/mongodb';

describe('MongoWorkoutRepository', () => {
  let mongod: StartedMongoDBContainer;
  let mongoConnection: MongoConnection;
  let repository: MongoWorkoutRepository;
  let collection: Collection<MongoWorkout>;
  let config: DeepMocked<Config>;

  beforeAll(async () => {
    mongod = await new MongoDBContainer('mongo:8.3.7').withUsername('admin').withPassword('password').start();
    config = createMock<Config>();
    config.getDbName.mockReturnValue('workouter_test');
    config.getMongoUrl.mockReturnValue(`${mongod.getConnectionString()}&directConnection=true`);
    mongoConnection = await MongoConnection.create(config);
  });

  afterAll(async () => {
    await mongoConnection.disconnect();
    await mongod.stop();
  });

  beforeEach(async () => {
    await mongoConnection.getDb().collection<MongoWorkout>('exercises').deleteMany({});
    repository = new MongoWorkoutRepository(mongoConnection.getDb());
    collection = mongoConnection.getDb().collection<MongoWorkout>('workouts');
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
