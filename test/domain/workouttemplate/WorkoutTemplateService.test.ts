import { randomUUID } from 'node:crypto';
import { type WorkoutTemplate } from '../../../src/domain/workouttemplate/model/WorkoutTemplate.js';
import { WorkoutTemplateService } from '../../../src/domain/workouttemplate/WorkoutTemplateService.js';
import { createMock, type DeepMocked } from '@golevelup/ts-jest';
import { type WorkoutTemplateRepository } from '../../../src/domain/workouttemplate/WorkoutTemplateRepository.js';
import { type Exercise } from '../../../src/domain/exercise/model/Exercise.js';
import { type ExerciseService } from '../../../src/domain/exercise/ExerciseService.js';
import {
  WorkoutTemplateExerciseNotFoundException,
  WorkoutTemplateNotFoundException,
} from '../../../src/domain/workouttemplate/WorkoutTemplateException.js';

describe('WorkoutTemplateService', () => {
  let workoutTemplateService: WorkoutTemplateService;
  let exerciseService: DeepMocked<ExerciseService>;
  let repository: DeepMocked<WorkoutTemplateRepository>;

  beforeEach(() => {
    repository = createMock<WorkoutTemplateRepository>();
    exerciseService = createMock<ExerciseService>();
    workoutTemplateService = new WorkoutTemplateService(repository, exerciseService);
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
    const exercise: Exercise = {
      id: randomUUID(),
      userId: userId,
      name: 'test exercise',
      description: 'test description',
    };
    const sets = 0;
    const restPeriod = 0;
    exerciseService.get.mockResolvedValue(exercise);

    //when
    await workoutTemplateService.addWorkoutTemplateExercise(exercise, workoutTemplate.id, userId, sets, restPeriod);

    //then
    expect(workoutTemplate.exercises).toHaveLength(1);
  });
  test('should add workoutTemplateExercise with sets and restPeriod to workoutTemplate', async () => {
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
    const exercise: Exercise = {
      id: randomUUID(),
      userId: userId,
      name: 'test exercise',
      description: 'test description',
    };
    const sets = 3;
    const restPeriod = 180;

    exerciseService.get.mockResolvedValue(exercise);
    //when
    await workoutTemplateService.addWorkoutTemplateExercise(exercise, workoutTemplate.id, userId, sets, restPeriod);

    //then
    expect(workoutTemplate.exercises).toHaveLength(1);
    expect(workoutTemplate.exercises[0].sets).toBe(sets);
    expect(workoutTemplate.exercises[0].restPeriod).toBe(restPeriod);
  });

  test('should throw error when trying to add workoutTemplateExercise to workoutTemplate that does not exist', async () => {
    //given
    const userId = randomUUID();
    const templateId = randomUUID();
    repository.get.mockResolvedValue(null);
    const exercise = randomUUID();
    const sets = 0;
    const restPeriod = 0;

    //when
    await expect(
      workoutTemplateService.addWorkoutTemplateExercise(exercise, templateId, userId, sets, restPeriod),
    ).rejects.toThrow(WorkoutTemplateNotFoundException);

    //then
    expect(repository.get).toHaveBeenCalledWith(templateId, userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.saveWorkoutTemplateExercise).not.toHaveBeenCalled();
  });

  test('should throw error when trying to add workoutTemplateExercise with sets and restPeriod to workoutTemplate that does not exist', async () => {
    //given
    const userId = randomUUID();
    const templateId = randomUUID();
    repository.get.mockResolvedValue(null);
    const exercise = randomUUID();
    const sets = 3;
    const restPeriod = 180;

    //when
    await expect(
      workoutTemplateService.addWorkoutTemplateExercise(exercise, templateId, userId, sets, restPeriod),
    ).rejects.toThrow(WorkoutTemplateNotFoundException);

    //then
    expect(repository.get).toHaveBeenCalledWith(templateId, userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.saveWorkoutTemplateExercise).not.toHaveBeenCalled();
  });

  test('should throw error when trying to edit workoutTemplateName for non existing workoutTemplate', async () => {
    //given
    const userId = randomUUID();
    const templateId = randomUUID();
    repository.get.mockResolvedValue(null);
    const newName = 'updated workoutTemplate';

    //when
    await expect(workoutTemplateService.editWorkoutTemplateName(templateId, userId, newName)).rejects.toThrow(
      WorkoutTemplateNotFoundException,
    );

    //then
    expect(repository.get).toHaveBeenCalledWith(templateId, userId);
    expect(repository.save).not.toHaveBeenCalled();
  });

  test('should throw error when trying to get a workoutTemplate that does not exist', async () => {
    //given
    const userId = randomUUID();
    const templateId = randomUUID();
    repository.get.mockResolvedValue(null);

    //when
    await expect(workoutTemplateService.getWorkoutTemplate(templateId, userId)).rejects.toThrow(
      WorkoutTemplateNotFoundException,
    );

    //then
    expect(repository.get).toHaveBeenCalledWith(templateId, userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
  });

  test('should throw error when trying to remove a workoutTemplateExercise that does not exist in workoutTemplate', async () => {
    //given
    const userId = randomUUID();
    const templateId = randomUUID();
    const workoutTemplate: WorkoutTemplate = {
      id: templateId,
      name: 'test workoutTemplate',
      userId,
      exercises: [],
    };
    repository.get.mockResolvedValue(workoutTemplate);

    //when
    await expect(workoutTemplateService.removeWorkoutTemplateExercise(templateId, userId, 0)).rejects.toThrow(
      WorkoutTemplateExerciseNotFoundException,
    );

    //then
    expect(repository.get).toHaveBeenCalledWith(templateId, userId);
    expect(repository.save).not.toHaveBeenCalled();
  });

  test('should throw error when trying to edit a workoutTemplateExercise that does not exist', async () => {
    //given
    const userId = randomUUID();
    const templateId = randomUUID();
    const exerciseId = randomUUID();
    repository.getByOrder.mockResolvedValue(null);

    //when
    await expect(
      workoutTemplateService.editWorkoutTemplateExercise(templateId, userId, 0, exerciseId, 3, 180),
    ).rejects.toThrow(WorkoutTemplateExerciseNotFoundException);

    //then
    expect(repository.getByOrder).toHaveBeenCalledWith(templateId, userId, 0);
    expect(repository.saveWorkoutTemplateExercise).not.toHaveBeenCalled();
  });

  test('should edit workoutTemplateExercise in workoutTemplate', async () => {
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
          restPeriod: 180,
          order: 0,
        },
      ],
    };
    repository.getByOrder.mockResolvedValue(workoutTemplate.exercises[0]);
    const newExercise: Exercise = {
      id: randomUUID(),
      userId: userId,
      name: 'test exercise',
      description: 'test description',
    };
    const newSets = 4;
    const newRestPeriod = 360;
    const editedExercise = {
      exercise: newExercise,
      sets: newSets,
      restPeriod: newRestPeriod,
      order: 0,
    };

    exerciseService.get.mockResolvedValue(newExercise);
    //when
    await workoutTemplateService.editWorkoutTemplateExercise(
      templateId,
      userId,
      0,
      newExercise,
      newSets,
      newRestPeriod,
    );

    //then
    expect(repository.getByOrder).toHaveBeenCalledWith(templateId, userId, 0);
    expect(repository.getByOrder).toHaveBeenCalledTimes(1);
    expect(repository.saveWorkoutTemplateExercise).toHaveBeenCalledWith(templateId, userId, editedExercise);
    expect(repository.saveWorkoutTemplateExercise).toHaveBeenCalledTimes(1);
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
    //when
    repository.get.mockResolvedValue(workoutTemplate);
    await workoutTemplateService.removeWorkoutTemplateExercise(workoutTemplate.id, userId, 0);

    //then
    expect(repository.get).toHaveBeenCalledWith(workoutTemplate.id, userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(workoutTemplate.exercises).toHaveLength(1);
    expect(repository.save).toHaveBeenCalledWith(workoutTemplate);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });
  test('should throw error when trying to remove workoutTemplateExercise from workoutTemplate if it does not exist', async () => {
    //given
    const userId = randomUUID();
    //when
    repository.get.mockResolvedValue(null);
    await expect(workoutTemplateService.removeWorkoutTemplateExercise(randomUUID(), userId, 0)).rejects.toThrow(
      WorkoutTemplateNotFoundException,
    );
    //then
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.saveWorkoutTemplateExercise).not.toHaveBeenCalled();
  });
});
