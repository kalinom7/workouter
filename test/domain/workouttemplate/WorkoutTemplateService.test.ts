import { randomUUID } from 'node:crypto';
import { type WorkoutTemplate } from '../../../src/domain/workouttemplate/model/WorkoutTemplate.js';
import { WorkoutTemplateService } from '../../../src/domain/workouttemplate/WorkoutTemplateService.js';
import { createMock, type DeepMocked } from '@golevelup/ts-jest';
import { type WorkoutTemplateRepository } from '../../../src/domain/workouttemplate/WorkoutTemplateRepository.js';

describe('WorkoutTemplateService', () => {
  let workoutTemplateService: WorkoutTemplateService;
  let repository: DeepMocked<WorkoutTemplateRepository>;

  beforeEach(() => {
    repository = createMock<WorkoutTemplateRepository>();
    workoutTemplateService = new WorkoutTemplateService(repository);
  });

  test('should create workoutTemplate', async () => {
    //given
    const userId = randomUUID();
    const workoutTemplate: WorkoutTemplate = {
      id: expect.any(String),
      name: 'test workoutTemplate',
      userId: userId,
      exercises: [],
    };

    //when
    const createdWorkoutTemplate = await workoutTemplateService.createWorkoutTemplate('test workoutTemplate', userId);

    //then
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        name: 'test workoutTemplate',
        userId: userId,
        exercises: [],
      }),
    );
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(createdWorkoutTemplate.id).toBeDefined();
    expect(createdWorkoutTemplate.name).toBe('test workoutTemplate');
    expect(createdWorkoutTemplate.exercises).toEqual([]);
    expect(createdWorkoutTemplate).toEqual(workoutTemplate);
  });

  test('should get workoutTemplate', async () => {
    //given
    const id = randomUUID();
    const userId = randomUUID();
    const workoutTemplate: WorkoutTemplate = {
      id,
      name: 'test workoutTemplate',
      userId,
      exercises: [],
    };
    repository.get.mockResolvedValue(workoutTemplate);

    //when
    const fetchedWorkoutTemplate = await workoutTemplateService.getWorkoutTemplate(id, userId);

    //then
    expect(fetchedWorkoutTemplate).toBe(workoutTemplate);
    expect(repository.get).toHaveBeenCalledWith(id, userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(fetchedWorkoutTemplate.id).toBe(id);
    expect(fetchedWorkoutTemplate.name).toBe('test workoutTemplate');
    expect(fetchedWorkoutTemplate.exercises).toEqual([]);
  });

  test('should add workoutTemplateExercise to workoutTemplate', async () => {
    //given
    const userId = randomUUID();
    const templateId = randomUUID();
    const workoutTemplate: WorkoutTemplate = {
      id: templateId,
      name: 'test workoutTemplate',
      userId: userId,
      exercises: [],
    };
    repository.get.mockResolvedValue(workoutTemplate);
    const exercise = randomUUID();

    //when
    await workoutTemplateService.addWorkoutTemplateExercise(exercise, workoutTemplate.id, userId);

    //then
    expect(workoutTemplate.exercises.length).toBe(1);
  });

  test('should set number of sets for the workoutTemplateExercise if it exists', async () => {
    //given
    const userId = randomUUID();
    const templateId = randomUUID();
    const workoutTemplate: WorkoutTemplate = {
      id: templateId,
      name: 'test workoutTemplate',
      userId: userId,
      exercises: [
        {
          exercise: randomUUID(),
          sets: 0,
          restPeriod: 0,
          order: 0,
        },
      ],
    };
    const numberOfSets = 4;
    //when
    repository.getByOrder.mockResolvedValue(workoutTemplate.exercises[0]);
    await workoutTemplateService.setNumberOfSets(numberOfSets, workoutTemplate.id, userId, 0);

    //then
    expect(repository.getByOrder).toHaveBeenCalledWith(workoutTemplate.id, userId, 0);
    expect(repository.getByOrder).toHaveBeenCalledTimes(1);
    expect(repository.saveWorkoutTemplateExercise).toHaveBeenCalledWith(
      workoutTemplate.id,
      userId,
      expect.objectContaining({
        exercise: workoutTemplate.exercises[0].exercise,
        sets: numberOfSets,
        restPeriod: workoutTemplate.exercises[0].restPeriod,
        order: workoutTemplate.exercises[0].order,
      }),
    );
    expect(repository.saveWorkoutTemplateExercise).toHaveBeenCalledTimes(1);
    expect(workoutTemplate.exercises[0].sets).toEqual(numberOfSets);
  });

  test('should throw error when trying to set number of sets for the workoutTemplateExercise if it does not exist', async () => {
    //given
    const numberOfSets = 4;
    const userId = randomUUID();
    //when
    repository.getByOrder.mockResolvedValue(null);
    await expect(workoutTemplateService.setNumberOfSets(numberOfSets, randomUUID(), userId, 0)).rejects.toThrow();
    await expect(workoutTemplateService.setNumberOfSets(numberOfSets, randomUUID(), randomUUID(), 0)).rejects.toThrow();
    //then
    expect(repository.getByOrder).toHaveBeenCalledTimes(2);
    expect(repository.saveWorkoutTemplateExercise).not.toHaveBeenCalled();
  });
  test('should set rest period for the workoutTemplateExercise if it exists', async () => {
    //given
    const userId = randomUUID();
    const templateId = randomUUID();
    const workoutTemplate: WorkoutTemplate = {
      id: templateId,
      name: 'test workoutTemplate',
      userId: userId,
      exercises: [
        {
          exercise: randomUUID(),
          sets: 0,
          restPeriod: 0,
          order: 0,
        },
      ],
    };
    const restPeriod = 180;
    //when
    repository.getByOrder.mockResolvedValue(workoutTemplate.exercises[0]);
    await workoutTemplateService.setRestPeriod(restPeriod, workoutTemplate.id, userId, 0);

    //then
    expect(repository.getByOrder).toHaveBeenCalledWith(workoutTemplate.id, userId, 0);
    expect(repository.getByOrder).toHaveBeenCalledTimes(1);
    expect(workoutTemplate.exercises[0].restPeriod).toEqual(restPeriod);
    expect(repository.saveWorkoutTemplateExercise).toHaveBeenCalledWith(
      workoutTemplate.id,
      userId,
      expect.objectContaining({
        exercise: workoutTemplate.exercises[0].exercise,
        sets: workoutTemplate.exercises[0].sets,
        restPeriod: restPeriod,
        order: workoutTemplate.exercises[0].order,
      }),
    );
    expect(repository.saveWorkoutTemplateExercise).toHaveBeenCalledTimes(1);
  });
  test('should throw error when trying to set rest period for the workoutTemplateExercise if it does not exist', async () => {
    //given
    const restPeriod = 180;
    const userId = randomUUID();
    //when
    repository.getByOrder.mockResolvedValue(null);
    await expect(workoutTemplateService.setRestPeriod(restPeriod, randomUUID(), userId, 0)).rejects.toThrow();
    await expect(workoutTemplateService.setRestPeriod(restPeriod, randomUUID(), randomUUID(), 0)).rejects.toThrow();
    //then
    expect(repository.getByOrder).toHaveBeenCalledTimes(2);
    expect(repository.saveWorkoutTemplateExercise).not.toHaveBeenCalled();
  });
  test('should remove workoutTemplateExercise from workoutTemplate if it exists', async () => {
    //given
    const userId = randomUUID();
    const templateId = randomUUID();
    const workoutTemplate: WorkoutTemplate = {
      id: templateId,
      name: 'test workoutTemplate',
      userId: userId,
      exercises: [
        {
          exercise: randomUUID(),
          sets: 3,
          restPeriod: 360,
          order: 0,
        },
        {
          exercise: randomUUID(),
          sets: 4,
          restPeriod: 180,
          order: 1,
        },
      ],
    };
    console.log(workoutTemplate);
    //when
    repository.get.mockResolvedValue(workoutTemplate);
    await workoutTemplateService.removeWorkoutTemplateExercise(workoutTemplate.id, userId, 0);

    //then
    console.log(workoutTemplate);
    expect(repository.get).toHaveBeenCalledWith(workoutTemplate.id, userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(workoutTemplate.exercises.length).toBe(1);
    expect(repository.save).toHaveBeenCalledWith(workoutTemplate);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });
  test('should throw error when trying to remove workoutTemplateExercise from workoutTemplate if it does not exist', async () => {
    //given
    const userId = randomUUID();
    //when
    repository.get.mockResolvedValue(null);
    await expect(workoutTemplateService.removeWorkoutTemplateExercise(randomUUID(), userId, 0)).rejects.toThrow();
    //then
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.saveWorkoutTemplateExercise).not.toHaveBeenCalled();
  });
});
