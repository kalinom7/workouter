import { randomUUID } from 'node:crypto';
import {} from '@golevelup/ts-jest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoWorkoutTemplateRepository } from '../../../src/application/repository/WorkoutTemplate/MongoWorkoutTemplateRepository';
import { MongoConnection } from '../../../src/application/MongoConnection';
import process from 'node:process';
import { type WorkoutTemplate } from '../../../src/domain/workouttemplate/model/WorkoutTemplate';
import { type WorkoutTemplateExercise } from '../../../src/domain/workouttemplate/model/WorkoutTemplateExercise';

describe('MongoWorkoutTemplateRepository', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: MongoConnection;
  let repository: MongoWorkoutTemplateRepository;
  const originalMongoUrl = process.env['MONGO_URL'];
  const originalMongoDatabase = process.env['MONGO_DATABASE'];

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env['MONGO_URL'] = mongod.getUri();
    process.env['MONGO_DATABASE'] = 'test-workout-template-repository';

    mongoConnection = await MongoConnection.create();
  });

  afterAll(async () => {
    await mongoConnection.disconnect();
    await mongod.stop();
    process.env['MONGO_URL'] = originalMongoUrl;
    process.env['MONGO_DATABASE'] = originalMongoDatabase;
  });

  beforeEach(async () => {
    await mongoConnection.getDb().collection('workoutTemplates').deleteMany({});
    repository = new MongoWorkoutTemplateRepository(mongoConnection.getDb());
  });

  test('should get existing workoutTemplate', async () => {
    //given
    const workoutTemplateId = randomUUID();
    const userId = randomUUID();
    const workoutTemplate: WorkoutTemplate = {
      id: workoutTemplateId,
      name: 'test workoutTemplate',
      userId: userId,
      exercises: [],
    };
    await mongoConnection
      .getDb()
      .collection('workoutTemplates')
      .insertOne({ ...workoutTemplate });

    //when
    const returnedWorkoutTemplate = await repository.get(workoutTemplateId, userId);

    //then
    expect(returnedWorkoutTemplate).toEqual(workoutTemplate);
  });

  test('should add workoutTemplate with save', async () => {
    //given
    const workoutTemplateId = randomUUID();
    const userId = randomUUID();
    const workoutTemplate: WorkoutTemplate = {
      id: workoutTemplateId,
      name: 'test workoutTemplate',
      userId: userId,
      exercises: [],
    };

    //when
    await repository.save(workoutTemplate);

    //then
    const result = await mongoConnection
      .getDb()
      .collection<WorkoutTemplate>('workoutTemplates')
      .findOne(
        {
          id: workoutTemplateId,
          name: 'test workoutTemplate',
          userId: userId,
          exercises: [],
        },
        { projection: { _id: 0 } },
      );

    expect(result).toEqual(workoutTemplate);
  });

  test('should save changes to workout template', async () => {
    //given
    const workoutTemplateId = randomUUID();
    const userId = randomUUID();
    const workoutTemplate: WorkoutTemplate = {
      id: workoutTemplateId,
      name: 'test workoutTemplate',
      userId: userId,
      exercises: [],
    };
    await mongoConnection.getDb().collection('workoutTemplates').insertOne(workoutTemplate);
    const numberOfDocumentsBefore = await (
      await mongoConnection.getDb().collection<WorkoutTemplate>('workoutTemplates').find().toArray()
    ).length;
    const changedWorkoutTemplate: WorkoutTemplate = {
      id: workoutTemplateId,
      name: 'changed test workoutTemplate',
      userId: userId,
      exercises: [],
    };

    //when
    await repository.save(changedWorkoutTemplate);

    //then
    const numberOfDocumentsAfter = await (
      await mongoConnection.getDb().collection<WorkoutTemplate>('workoutTemplates').find().toArray()
    ).length;
    const result = await mongoConnection
      .getDb()
      .collection<WorkoutTemplate>('workoutTemplates')
      .findOne(
        {
          id: workoutTemplateId,
        },
        { projection: { _id: 0 } },
      );

    expect(result).toEqual(changedWorkoutTemplate);
    expect(numberOfDocumentsBefore).toEqual(numberOfDocumentsAfter);
  });

  test('should save workout template exercise changes', async () => {
    //given
    //given
    const workoutTemplateId = randomUUID();
    const exerciseId = randomUUID();
    const userId = randomUUID();
    const workoutTemplate: WorkoutTemplate = {
      id: workoutTemplateId,
      name: 'test workoutTemplate',
      userId: userId,
      exercises: [
        {
          exercise: exerciseId,
          sets: 0,
          restPeriod: 0,
          order: 0,
        },
      ],
    };
    await mongoConnection.getDb().collection('workoutTemplates').insertOne(workoutTemplate);
    const numberOfDocumentsBefore = await (
      await mongoConnection.getDb().collection<WorkoutTemplate>('workoutTemplates').find().toArray()
    ).length;
    const changedWorkoutTemplateExercise: WorkoutTemplateExercise = {
      exercise: exerciseId,
      sets: 3,
      restPeriod: 180,
      order: 0,
    };

    //when
    await repository.saveWorkoutTemplateExercise(workoutTemplateId, userId, changedWorkoutTemplateExercise);

    //then
    const result = await mongoConnection
      .getDb()
      .collection<WorkoutTemplate>('workoutTemplates')
      .findOne(
        { id: workoutTemplateId, userId: userId, 'exercises.order': 0 },
        { projection: { _id: 0, 'exercises.$': 1 } },
      );
    const exerciseAfterChanges = result?.exercises[0];
    const numberOfDocumentsAfter = await (
      await mongoConnection.getDb().collection<WorkoutTemplate>('workoutTemplates').find().toArray()
    ).length;

    expect(exerciseAfterChanges).toEqual(changedWorkoutTemplateExercise);
    expect(numberOfDocumentsAfter).toEqual(numberOfDocumentsBefore);
  });
  test('should get return null when workoutTemplate does not exist', async () => {
    //given
    const workoutTemplateId = randomUUID();
    const userId = randomUUID();

    //when
    const returnedWorkoutTemplate = await repository.get(workoutTemplateId, userId);

    //then
    expect(returnedWorkoutTemplate).toBeNull();
  });

  test('should not get workoutTemplate belonging to another user', async () => {
    //given
    const workoutTemplateId = randomUUID();
    const userId = randomUUID();
    const otherUserId = randomUUID();
    const workoutTemplate: WorkoutTemplate = {
      id: workoutTemplateId,
      name: 'test workoutTemplate',
      userId: userId,
      exercises: [],
    };
    await mongoConnection.getDb().collection('workoutTemplates').insertOne(workoutTemplate);

    //when
    const returnedWorkoutTemplate = await repository.get(workoutTemplateId, otherUserId);

    //then
    expect(returnedWorkoutTemplate).toBeNull();
  });

  test('should get all workoutTemplates for user', async () => {
    //given
    const userId = randomUUID();
    const otherUserId = randomUUID();
    const workoutTemplate1: WorkoutTemplate = {
      id: randomUUID(),
      name: 'first workoutTemplate',
      userId: userId,
      exercises: [],
    };
    const workoutTemplate2: WorkoutTemplate = {
      id: randomUUID(),
      name: 'second workoutTemplate',
      userId: userId,
      exercises: [],
    };
    const otherUsersWorkoutTemplate: WorkoutTemplate = {
      id: randomUUID(),
      name: 'other users workoutTemplate',
      userId: otherUserId,
      exercises: [],
    };
    await mongoConnection
      .getDb()
      .collection('workoutTemplates')
      .insertMany([{ ...workoutTemplate1 }, { ...workoutTemplate2 }, { ...otherUsersWorkoutTemplate }]);

    //when
    const returnedWorkoutTemplates = await repository.getAll(userId);

    //then
    expect(returnedWorkoutTemplates).toEqual(expect.arrayContaining([workoutTemplate1, workoutTemplate2]));
    expect(returnedWorkoutTemplates).toHaveLength(2);
  });

  test('should return empty array when user has no workoutTemplates', async () => {
    //given
    const userId = randomUUID();

    //when
    const returnedWorkoutTemplates = await repository.getAll(userId);

    //then
    expect(returnedWorkoutTemplates).toEqual([]);
  });

  test('should get workoutTemplateExercise by order', async () => {
    //given
    const workoutTemplateId = randomUUID();
    const exerciseId = randomUUID();
    const userId = randomUUID();
    const workoutTemplateExercise: WorkoutTemplateExercise = {
      exercise: exerciseId,
      sets: 3,
      restPeriod: 90,
      order: 1,
    };
    const workoutTemplate: WorkoutTemplate = {
      id: workoutTemplateId,
      name: 'test workoutTemplate',
      userId: userId,
      exercises: [workoutTemplateExercise],
    };
    await mongoConnection.getDb().collection('workoutTemplates').insertOne(workoutTemplate);

    //when
    const returnedExercise = await repository.getByOrder(workoutTemplateId, userId, 1);

    //then
    expect(returnedExercise).toEqual(workoutTemplateExercise);
  });

  test('should return null when workoutTemplateExercise order does not exist', async () => {
    //given
    const workoutTemplateId = randomUUID();
    const userId = randomUUID();
    const workoutTemplate: WorkoutTemplate = {
      id: workoutTemplateId,
      name: 'test workoutTemplate',
      userId: userId,
      exercises: [],
    };
    await mongoConnection.getDb().collection('workoutTemplates').insertOne(workoutTemplate);

    //when
    const returnedExercise = await repository.getByOrder(workoutTemplateId, userId, 0);

    //then
    expect(returnedExercise).toBeNull();
  });

  test('should throw error when saving workoutTemplateExercise that does not exist', async () => {
    //given
    const workoutTemplateId = randomUUID();
    const userId = randomUUID();
    const workoutTemplate: WorkoutTemplate = {
      id: workoutTemplateId,
      name: 'test workoutTemplate',
      userId: userId,
      exercises: [],
    };
    await mongoConnection.getDb().collection('workoutTemplates').insertOne(workoutTemplate);
    const workoutTemplateExercise: WorkoutTemplateExercise = {
      exercise: randomUUID(),
      sets: 3,
      restPeriod: 180,
      order: 0,
    };

    //when
    //then
    await expect(
      repository.saveWorkoutTemplateExercise(workoutTemplateId, userId, workoutTemplateExercise),
    ).rejects.toThrow('Workout template exercise not found');
  });

  test('should delete workoutTemplate', async () => {
    //given
    const workoutTemplateId = randomUUID();
    const userId = randomUUID();
    const workoutTemplate: WorkoutTemplate = {
      id: workoutTemplateId,
      name: 'test workoutTemplate',
      userId: userId,
      exercises: [],
    };
    await mongoConnection.getDb().collection('workoutTemplates').insertOne(workoutTemplate);

    //when
    await repository.delete(workoutTemplateId, userId);

    //then
    const result = await mongoConnection
      .getDb()
      .collection<WorkoutTemplate>('workoutTemplates')
      .findOne({ id: workoutTemplateId });

    expect(result).toBeNull();
  });

  test('should not delete workoutTemplate belonging to another user', async () => {
    //given
    const workoutTemplateId = randomUUID();
    const userId = randomUUID();
    const otherUserId = randomUUID();
    const workoutTemplate: WorkoutTemplate = {
      id: workoutTemplateId,
      name: 'test workoutTemplate',
      userId: userId,
      exercises: [],
    };
    await mongoConnection.getDb().collection('workoutTemplates').insertOne(workoutTemplate);

    //when
    await repository.delete(workoutTemplateId, otherUserId);

    //then
    const result = await mongoConnection
      .getDb()
      .collection<WorkoutTemplate>('workoutTemplates')
      .findOne({ id: workoutTemplateId });

    expect(result).not.toBeNull();
  });

  test('should remove workoutTemplateExercise', async () => {
    //given
    const workoutTemplateId = randomUUID();
    const userId = randomUUID();
    const remainingExercise: WorkoutTemplateExercise = {
      exercise: randomUUID(),
      sets: 3,
      restPeriod: 90,
      order: 1,
    };
    const exerciseToRemove: WorkoutTemplateExercise = {
      exercise: randomUUID(),
      sets: 4,
      restPeriod: 120,
      order: 0,
    };
    const workoutTemplate: WorkoutTemplate = {
      id: workoutTemplateId,
      name: 'test workoutTemplate',
      userId: userId,
      exercises: [exerciseToRemove, remainingExercise],
    };
    await mongoConnection.getDb().collection('workoutTemplates').insertOne(workoutTemplate);

    //when
    await repository.removeWorkoutTemplateExercise(workoutTemplateId, userId, 0);

    //then
    const result = await mongoConnection
      .getDb()
      .collection<WorkoutTemplate>('workoutTemplates')
      .findOne({ id: workoutTemplateId }, { projection: { _id: 0 } });

    expect(result?.exercises).toEqual([remainingExercise]);
  });
});
