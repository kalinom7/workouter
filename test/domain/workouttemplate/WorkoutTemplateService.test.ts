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

  test('should throw error when trying to set number of sets for the workoutTemplateExercise if it does not exist', async () => {});
  test('should set rest period for the workoutTemplateExercise if it exists', async () => {});
  test('should throw error when trying to set rest period for the workoutTemplateExercise if it does not exist', async () => {});
  test('should remove workoutTemplateExercise from workoutTemplate if it exists', async () => {});
  test('should throw error when trying to remove workoutTemplateExercise from workoutTemplate if it does not exist', async () => {});
});
