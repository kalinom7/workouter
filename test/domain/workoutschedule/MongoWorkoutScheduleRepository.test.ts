import {} from '@golevelup/ts-jest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoConnection } from '../../../src/application/MongoConnection';
import process from 'process';
import { MongoWorkoutScheduleRepository } from '../../../src/domain/workoutschedule/WorkoutScheduleRepository';
import { type Collection } from 'mongodb';
import { type WorkoutSchedule } from '../../../src/domain/workoutschedule/model/WorkoutSchedule';
import { randomUUID } from 'crypto';
import { date } from 'zod';

describe('MongoWorkoutScheduleRepository', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: MongoConnection;
  let repository: MongoWorkoutScheduleRepository;
  let collection: Collection<WorkoutSchedule>;
  const originalUrl = process.env['MONGO_URL'];
  const originalDb = process.env['MONGO_DATABASE'];

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env['MONGO_URL'] = mongod.getUri();
    process.env['MONGO_DATABASE'] = 'test-workout-schedule-repository';
    mongoConnection = new MongoConnection();
    await mongoConnection.connect();
  });
  afterAll(async () => {
    process.env['MONGO_URL'] = originalUrl;
    process.env['MONGO_DATABASE'] = originalDb;
    await mongoConnection.disconnect();
    await mongod.stop();
  });
  beforeEach(async () => {
    collection = mongoConnection.getDb().collection<WorkoutSchedule>('workoutSchedules');
    await collection.deleteMany({});
    repository = new MongoWorkoutScheduleRepository(mongoConnection);
  });

  test('should add workout schedule by save', async () => {
    //given
    const workoutScheduleId = randomUUID();
    const userId = randomUUID();
    const workoutSchedule: WorkoutSchedule = {
      id: workoutScheduleId,
      userId: userId,
      name: 'test workout schedule',
      isActive: false,
      setActiveDate: null,
      pattern: [],
      lastFinishedWorkoutDate: null,
      lastOrder: null,
    };

    //when
    await repository.save(workoutSchedule);

    //then
    const savedWorkoutSchedule = await collection.findOne({ id: workoutScheduleId }, { projection: { _id: 0 } });
    expect(savedWorkoutSchedule).toEqual(workoutSchedule);
  });
  test('should save changes to existing workout schedule', async () => {
    //given
    const workoutScheduleId = randomUUID();
    const userId = randomUUID();
    const workoutSchedule: WorkoutSchedule = {
      id: workoutScheduleId,
      userId: userId,
      name: 'test workout schedule',
      isActive: false,
      setActiveDate: null,
      pattern: [],
      lastFinishedWorkoutDate: null,
      lastOrder: null,
    };
    const changedWorkoutSchedule: WorkoutSchedule = {
      id: workoutScheduleId,
      userId: userId,
      name: 'changed workout schedule',
      isActive: true,
      setActiveDate: new Date(),
      pattern: [{ patternItemId: randomUUID(), order: 0, useOrder: 0, workoutTemplateId: randomUUID(), restDays: 2 }],
      lastFinishedWorkoutDate: null,
      lastOrder: null,
    };
    await collection.insertOne(workoutSchedule);

    //when
    await repository.save(changedWorkoutSchedule);

    //then
    const savedWorkoutSchedule = await collection.findOne(
      { id: workoutScheduleId, userId: userId },
      { projection: { _id: 0 } },
    );
    expect(savedWorkoutSchedule).toEqual(changedWorkoutSchedule);
  });
  test('should get existing schedule', async () => {
    //given
    const workoutScheduleId = randomUUID();
    const userId = randomUUID();
    const workoutSchedule: WorkoutSchedule = {
      id: workoutScheduleId,
      userId: userId,
      name: 'test workout schedule',
      isActive: false,
      setActiveDate: null,
      pattern: [],
      lastFinishedWorkoutDate: null,
      lastOrder: null,
    };
    await collection.insertOne({ ...workoutSchedule });

    //when
    const returnedWorkoutSchedule = await repository.get(workoutScheduleId, userId);

    //then
    expect(returnedWorkoutSchedule).toEqual(workoutSchedule);
  });
  test('should get all user workout schedules', async () => {
    //given
    const workoutScheduleId = randomUUID();
    const userId = randomUUID();
    const workoutSchedule1: WorkoutSchedule = {
      id: workoutScheduleId,
      userId: userId,
      name: 'test workout schedule1',
      isActive: false,
      setActiveDate: null,
      pattern: [],
      lastFinishedWorkoutDate: null,
      lastOrder: null,
    };
    const workoutSchedule2: WorkoutSchedule = {
      id: workoutScheduleId,
      userId: userId,
      name: 'test workout schedule2',
      isActive: false,
      setActiveDate: null,
      pattern: [],
      lastFinishedWorkoutDate: null,
      lastOrder: null,
    };
    const workoutSchedule3: WorkoutSchedule = {
      id: workoutScheduleId,
      userId: userId,
      name: 'test workout schedule3',
      isActive: false,
      setActiveDate: null,
      pattern: [],
      lastFinishedWorkoutDate: null,
      lastOrder: null,
    };
    const schedules: WorkoutSchedule[] = [workoutSchedule1, workoutSchedule2, workoutSchedule3];

    await collection.insertMany(schedules.map((schedule) => ({ ...schedule })));
    //when
    const returnedSchedules = await repository.getAll(userId);

    //then
    expect(returnedSchedules).toEqual(schedules);
  });
  test('should return active workout schedule', async () => {
    //given
    const workoutScheduleId = randomUUID();
    const userId = randomUUID();
    const workoutSchedule: WorkoutSchedule = {
      id: workoutScheduleId,
      userId: userId,
      name: 'test active workout schedule',
      isActive: true,
      setActiveDate: new Date(),
      pattern: [],
      lastFinishedWorkoutDate: null,
      lastOrder: null,
    };
    await collection.insertOne({ ...workoutSchedule });
    //when
    const returnedActiveSchedule = await repository.getActive(userId);
    //then
    expect(returnedActiveSchedule).toEqual(workoutSchedule);
  });

  test('should delete existing workout schedule', async () => {
    //given
    const workoutScheduleId = randomUUID();
    const userId = randomUUID();
    const workoutSchedule: WorkoutSchedule = {
      id: workoutScheduleId,
      userId: userId,
      name: 'test workout schedule',
      isActive: true,
      setActiveDate: new Date(),
      pattern: [],
      lastFinishedWorkoutDate: null,
      lastOrder: null,
    };
    await collection.insertOne(workoutSchedule);

    //when
    await repository.delete(workoutScheduleId, userId);

    //then
    const deletedWorkoutSchedule = await collection.findOne(workoutSchedule);
    expect(deletedWorkoutSchedule).toBeNull();
  });
});
