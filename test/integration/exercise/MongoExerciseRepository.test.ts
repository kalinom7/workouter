import {} from '@golevelup/ts-jest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoConnection } from '../../../src/application/MongoConnection';
import {
  type MongoExercise,
  MongoExerciseRepository,
} from '../../../src/application/repository/Exercise/MongoExerciseRepository';
import process from 'process';
import { type Exercise } from '../../../src/domain/exercise/model/Exercise';
import { randomUUID } from 'crypto';
import { type Collection } from 'mongodb';

describe('MongoExerciseRepository', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: MongoConnection;
  let repository: MongoExerciseRepository;
  let collection: Collection<MongoExercise>;

  const originalMongoUrl = process.env['MONGO_URL'];
  const originalMongoDatabase = process.env['MONGO_DATABASE'];

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env['MONGO_URL'] = mongod.getUri();
    process.env['MONGO_DATABASE'] = 'test-exercise-repository';

    mongoConnection = await MongoConnection.create();
  });

  afterAll(async () => {
    process.env['MONGO_URL'] = originalMongoUrl;
    process.env['MONGO_DATABASE'] = originalMongoDatabase;

    await mongoConnection.disconnect();
    await mongod.stop();
  });

  beforeEach(async () => {
    await mongoConnection.getDb().collection<MongoExercise>('exercises').deleteMany({});
    repository = new MongoExerciseRepository(mongoConnection.getDb());
    collection = mongoConnection.getDb().collection<MongoExercise>('exercises');
  });

  test('should add exercise by save', async () => {
    //given
    const exerciseId = randomUUID();
    const userId = randomUUID();

    const exercise: Exercise = {
      id: exerciseId,
      userId: userId,
      name: 'test exercise',
    };

    //when
    await repository.save(exercise);

    //then
    const savedExercise = await collection.findOne({ _id: exerciseId, userId: userId });
    expect(savedExercise).toEqual({
      _id: exerciseId,
      userId: userId,
      name: 'test exercise',
    });
  });

  test('should save changes to exercise', async () => {
    //given
    const exerciseId = randomUUID();
    const userId = randomUUID();

    const exercise: MongoExercise = {
      _id: exerciseId,
      userId: userId,
      name: 'test exercise',
    };
    const changedExercise: Exercise = {
      id: exerciseId,
      userId: userId,
      name: 'changed exercise',
    };

    await collection.insertOne(exercise);
    //when
    await repository.save(changedExercise);

    //then
    const savedExercise = await collection.findOne({ _id: exerciseId, userId: userId });
    expect(savedExercise).toEqual({
      _id: exerciseId,
      userId: userId,
      name: 'changed exercise',
    });
  });
  test('should get existing exercise', async () => {
    //given
    const exerciseId = randomUUID();
    const userId = randomUUID();

    const exercise: MongoExercise = {
      _id: exerciseId,
      userId: userId,
      name: 'test exercise',
    };

    await collection.insertOne({ ...exercise });

    //when
    const returnedExercise = await repository.get(exerciseId, userId);

    //then
    expect(returnedExercise).toEqual({ id: exerciseId, userId: userId, name: 'test exercise' });
  });
  test('should delete exercise', async () => {
    //given
    const exerciseId = randomUUID();
    const userId = randomUUID();

    const exercise: MongoExercise = {
      _id: exerciseId,
      userId: userId,
      name: 'test exercise',
    };

    await collection.insertOne(exercise);

    //when
    await repository.delete(exerciseId, userId);

    //then
    const foundExercise = await collection.findOne(exercise);
    expect(foundExercise).toBeNull();
  });
  test('should get all user exercises', async () => {
    //given
    const exerciseId1 = randomUUID();
    const exerciseId2 = randomUUID();
    const exerciseId3 = randomUUID();
    const userId = randomUUID();

    const exercise1: MongoExercise = {
      _id: exerciseId1,
      userId: userId,
      name: 'test exercise1',
    };
    const exercise2: MongoExercise = {
      _id: exerciseId2,
      userId: userId,
      name: 'test exercise2',
    };
    const exercise3: MongoExercise = {
      _id: exerciseId3,
      userId: userId,
      name: 'test exercise3',
    };
    const exercises: MongoExercise[] = [exercise1, exercise2, exercise3];
    await collection.insertMany(exercises.map((ex) => ({ ...ex })));

    //when
    const returnedExercises: Exercise[] = await repository.getAll(userId);

    //then
    expect(returnedExercises).toEqual(exercises.map((ex) => ({ id: ex._id, userId: ex.userId, name: ex.name })));
  });
});
