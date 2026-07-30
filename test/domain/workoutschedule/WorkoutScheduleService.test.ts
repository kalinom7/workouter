import { randomUUID } from 'node:crypto';
import { WorkoutScheduleService } from '../../../src/domain/workoutschedule/WorkoutScheduleService.js';
import { WorkoutScheduleNotFoundException } from '../../../src/domain/workoutschedule/WorkoutScheduleExceptions.js';
import { type WorkoutScheduleRepository } from '../../../src/domain/workoutschedule/WorkoutScheduleRepository.js';
import { createMock, type DeepMocked } from '@golevelup/ts-jest';
import { type WorkoutSchedule } from '../../../src/domain/workoutschedule/model/WorkoutSchedule.js';
import { type WorkoutTemplateService } from '../../../src/domain/workouttemplate/WorkoutTemplateService.js';
import { type WorkoutTemplate } from '../../../src/domain/workouttemplate/model/WorkoutTemplate.js';

describe('WorkoutScheduleService', () => {
  let workoutScheduleService: WorkoutScheduleService;
  let workoutTemplateService: DeepMocked<WorkoutTemplateService>;
  let repository: DeepMocked<WorkoutScheduleRepository>;

  beforeEach(() => {
    repository = createMock<WorkoutScheduleRepository>();
    workoutTemplateService = createMock<WorkoutTemplateService>();
    workoutScheduleService = new WorkoutScheduleService(repository, workoutTemplateService);
  });
  test('should create workout schedule', async () => {
    //given
    const userId = randomUUID();
    const workoutScheduleName = 'test schedule';
    //when
    const createdWorkoutSchedule = await workoutScheduleService.create(workoutScheduleName, userId);
    //then
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        name: workoutScheduleName,
        userId: userId,
        isActive: false,
        setActiveDate: null,
        pattern: [],
        lastOrder: null,
        lastFinishedWorkoutDate: null,
      }),
    );
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(createdWorkoutSchedule.id).toBeDefined();
    expect(createdWorkoutSchedule.name).toBe(workoutScheduleName);
    expect(createdWorkoutSchedule.userId).toBe(userId);
    expect(createdWorkoutSchedule.isActive).toBe(false);
    expect(createdWorkoutSchedule.setActiveDate).toBeNull();

    expect(createdWorkoutSchedule.pattern).toEqual([]);
  });
  test('should get workout schedule if it exists', async () => {
    //given
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    const workoutSchedule: WorkoutSchedule = {
      id: workoutScheduleId,
      name: 'test schedule',
      userId: userId,
      isActive: false,
      setActiveDate: null,
      pattern: [],
      lastOrder: null,
      lastFinishedWorkoutDate: null,
    };
    repository.get.mockResolvedValueOnce(workoutSchedule);
    //when
    const fetchedWorkoutSchedule = await workoutScheduleService.get(workoutScheduleId, userId);
    //then
    expect(repository.get).toHaveBeenCalledWith(workoutScheduleId, userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(fetchedWorkoutSchedule).toEqual(workoutSchedule);
  });
  test('should throw error when trying to get workout schedule that does not exist', async () => {
    //given
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    repository.get.mockResolvedValueOnce(null);
    //when & then
    await expect(workoutScheduleService.get(workoutScheduleId, userId)).rejects.toThrow(
      WorkoutScheduleNotFoundException,
    );
    expect(repository.get).toHaveBeenCalledWith(workoutScheduleId, userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
  });
  test('should delete workout schedule if it exists', async () => {
    //given
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    const workoutSchedule = {
      id: workoutScheduleId,
      name: 'test schedule',
      userId: userId,
      isActive: false,
      setActiveDate: null,
      pattern: [],
      lastOrder: null,
      lastFinishedWorkoutDate: null,
    };
    repository.get.mockResolvedValueOnce(workoutSchedule);
    //when
    await workoutScheduleService.delete(workoutScheduleId, userId);
    //then
    expect(repository.get).toHaveBeenCalledWith(workoutScheduleId, userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.delete).toHaveBeenCalledWith(workoutScheduleId, userId);
    expect(repository.delete).toHaveBeenCalledTimes(1);
  });
  test('should throw error when trying to delete workout schedule that does not exist', async () => {
    //given
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    repository.get.mockResolvedValueOnce(null);
    //when & then
    await expect(workoutScheduleService.delete(workoutScheduleId, userId)).rejects.toThrow(
      WorkoutScheduleNotFoundException,
    );
    expect(repository.get).toHaveBeenCalledWith(workoutScheduleId, userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.delete).not.toHaveBeenCalled();
  });
  test('should add workout to pattern if workout schedule exists', async () => {
    //given
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    const workoutTemplateId = randomUUID();
    const workoutSchedule = {
      id: workoutScheduleId,
      name: 'test schedule',
      userId: userId,
      isActive: false,
      setActiveDate: null,
      pattern: [],
      lastOrder: null,
      lastFinishedWorkoutDate: null,
    };
    repository.get.mockResolvedValueOnce(workoutSchedule);

    const workoutTemplate: WorkoutTemplate = {
      id: workoutTemplateId,
      name: 'test template',
      userId: userId,
      exercises: [],
    };
    workoutTemplateService.getWorkoutTemplate.mockResolvedValueOnce(workoutTemplate);

    //when
    const updatedWorkoutSchedule = await workoutScheduleService.addWorkoutToPattern(
      workoutTemplateId,
      userId,
      workoutScheduleId,
    );
    //then
    expect(repository.get).toHaveBeenCalledWith(workoutScheduleId, userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(workoutTemplateService.getWorkoutTemplate).toHaveBeenCalledWith(workoutTemplateId, userId);
    expect(updatedWorkoutSchedule.pattern).toHaveLength(1);
    expect(updatedWorkoutSchedule.pattern[0]).toEqual({
      id: expect.any(String),
      order: 0,
      useOrder: 0,
      workoutTemplate: workoutTemplate,
      restDays: 0,
    });
  });

  test('should add rest to workout in pattern if they exist', async () => {
    //given
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    const patternItemId = randomUUID();
    const workoutTemplateId = randomUUID();
    const workoutTemplate: WorkoutTemplate = {
      id: workoutTemplateId,
      userId: userId,
      name: 'test workoutTemplate',
      exercises: [],
    };
    const workoutSchedule: WorkoutSchedule = {
      id: workoutScheduleId,
      name: 'test schedule',
      userId: userId,
      isActive: false,
      setActiveDate: null,
      pattern: [
        {
          id: patternItemId,
          order: 0,
          useOrder: 0,
          workoutTemplate: workoutTemplate,
          restDays: 0,
        },
      ],
      lastOrder: null,
      lastFinishedWorkoutDate: null,
    };
    const restDays = 2;
    repository.get.mockResolvedValueOnce(workoutSchedule);
    //when
    const updatedWorkoutSchedule = await workoutScheduleService.addRestToPatternWorkout(
      userId,
      workoutScheduleId,
      patternItemId,
      restDays,
    );
    //then
    expect(repository.get).toHaveBeenCalledWith(workoutScheduleId, userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(updatedWorkoutSchedule.pattern).toHaveLength(1);
    expect(updatedWorkoutSchedule.pattern[0]).toEqual(
      expect.objectContaining({
        id: workoutSchedule.pattern[0].id,
        order: 0,
        useOrder: 0,
        workoutTemplate: workoutTemplate,
        restDays: restDays,
      }),
    );
  });

  test('should throw error when trying to add workout to pattern of a workout schedule that does not exist', async () => {
    //given
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    const workoutTemplateId = randomUUID();
    repository.get.mockResolvedValueOnce(null);
    //when & then
    await expect(
      workoutScheduleService.addWorkoutToPattern(workoutTemplateId, userId, workoutScheduleId),
    ).rejects.toThrow(WorkoutScheduleNotFoundException);
    expect(repository.get).toHaveBeenCalledWith(workoutScheduleId, userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.save).not.toHaveBeenCalled();
  });

  test('should set workout schedule as active if it exists', async () => {
    //given
    const workoutSchedule = {
      id: randomUUID(),
      name: 'test schedule',
      userId: randomUUID(),
      isActive: false,
      setActiveDate: null,
      pattern: [],
      lastOrder: null,
      lastFinishedWorkoutDate: null,
    };
    repository.get.mockResolvedValueOnce(workoutSchedule);
    repository.getActive.mockResolvedValueOnce(null);
    //when
    const updatedWorkoutSchedule = await workoutScheduleService.setActive(workoutSchedule.id, workoutSchedule.userId);
    //then
    expect(repository.get).toHaveBeenCalledWith(workoutSchedule.id, workoutSchedule.userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(updatedWorkoutSchedule.isActive).toBe(true);
  });

  test('should set workout schedule as active and set previous active as inactive', async () => {
    //given
    const workoutSchedule = {
      id: randomUUID(),
      name: 'test schedule',
      userId: randomUUID(),
      isActive: false,
      setActiveDate: null,
      pattern: [],
      lastOrder: null,
      lastFinishedWorkoutDate: null,
    };
    const previousActiveWorkoutSchedule = {
      id: randomUUID(),
      name: 'test schedule',
      userId: randomUUID(),
      isActive: true,
      setActiveDate: new Date(),
      pattern: [],
      lastOrder: null,
      lastFinishedWorkoutDate: null,
    };

    repository.get.mockResolvedValueOnce(workoutSchedule);
    repository.getActive.mockResolvedValueOnce(previousActiveWorkoutSchedule);
    //when
    const updatedWorkoutSchedule = await workoutScheduleService.setActive(workoutSchedule.id, workoutSchedule.userId);
    //then
    expect(repository.get).toHaveBeenCalledWith(workoutSchedule.id, workoutSchedule.userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.getActive).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledTimes(2);
    expect(updatedWorkoutSchedule.isActive).toBe(true);
  });
  test('should throw error when trying to set workout schedule as active if it does not exist', async () => {
    //given
    const workoutScheduleId = randomUUID();
    const userId = randomUUID();
    repository.get.mockResolvedValueOnce(null);
    //when & then
    await expect(workoutScheduleService.setActive(workoutScheduleId, userId)).rejects.toThrow(
      WorkoutScheduleNotFoundException,
    );
    expect(repository.get).toHaveBeenCalledWith(workoutScheduleId, userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.save).not.toHaveBeenCalled();
  });
  test('should set workout schedule as inactive if it exists', async () => {
    //given
    const workoutSchedule = {
      id: randomUUID(),
      name: 'test schedule',
      userId: randomUUID(),
      isActive: true,
      setActiveDate: null,
      pattern: [],
      lastOrder: null,
      lastFinishedWorkoutDate: null,
    };
    repository.get.mockResolvedValueOnce(workoutSchedule);
    //when
    const updatedWorkoutSchedule = await workoutScheduleService.setInactive(workoutSchedule.id, workoutSchedule.userId);
    //then
    expect(repository.get).toHaveBeenCalledWith(workoutSchedule.id, workoutSchedule.userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(updatedWorkoutSchedule.isActive).toBe(false);
  });

  test('should remove pattern item from workout schedule if it exists', async () => {
    //given
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    const patternItemId = randomUUID();
    const workoutTemplateId = randomUUID();
    const workoutTemplate: WorkoutTemplate = {
      id: workoutTemplateId,
      userId: userId,
      name: 'test workoutTemplate',
      exercises: [],
    };
    const workoutSchedule: WorkoutSchedule = {
      id: workoutScheduleId,
      name: 'test schedule',
      userId: userId,
      isActive: false,
      setActiveDate: null,
      pattern: [
        {
          id: patternItemId,
          order: 0,
          useOrder: 0,
          workoutTemplate: workoutTemplate,
          restDays: 0,
        },
      ],
      lastOrder: null,
      lastFinishedWorkoutDate: null,
    };
    repository.get.mockResolvedValueOnce(workoutSchedule);
    //when
    const updatedWorkoutSchedule = await workoutScheduleService.removePatternItem(
      userId,
      workoutScheduleId,
      patternItemId,
    );
    //then
    expect(repository.get).toHaveBeenCalledWith(workoutScheduleId, userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(updatedWorkoutSchedule.pattern).toHaveLength(0);
  });
  test('should remove pattern item and reoder the remaining items order and useOrder', async () => {
    //given
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    const patternItemIdToRemove = randomUUID();
    const workoutSchedule = {
      id: workoutScheduleId,
      name: 'test schedule',
      userId: userId,
      isActive: false,
      setActiveDate: null,
      pattern: [
        {
          id: patternItemIdToRemove,
          order: 0,
          useOrder: 0,
          workoutTemplate: {
            id: randomUUID,
            userId: userId,
            name: 'template1',
            exercises: [],
          },
          restDays: 0,
        },
        {
          id: randomUUID(),
          order: 1,
          useOrder: 1,
          workoutTemplate: {
            id: randomUUID,
            userId: userId,
            name: 'template2',
            exercises: [],
          },
          restDays: 0,
        },
        {
          id: randomUUID(),
          order: 2,
          useOrder: 2,
          workoutTemplate: {
            id: randomUUID,
            userId: userId,
            name: 'template3',
            exercises: [],
          },
          restDays: 0,
        },
      ],
      lastOrder: null,
      lastFinishedWorkoutDate: null,
    };
    repository.get.mockResolvedValueOnce(workoutSchedule);
    //when
    const updatedWorkoutSchedule = await workoutScheduleService.removePatternItem(
      userId,
      workoutScheduleId,
      patternItemIdToRemove,
    );
    //then
    expect(repository.get).toHaveBeenCalledWith(workoutScheduleId, userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(updatedWorkoutSchedule.pattern).toHaveLength(2);
    expect(updatedWorkoutSchedule.pattern[0].order).toBe(0);
    expect(updatedWorkoutSchedule.pattern[0].useOrder).toBe(0);
    expect(updatedWorkoutSchedule.pattern[1].order).toBe(1);
    expect(updatedWorkoutSchedule.pattern[1].useOrder).toBe(1);
  });
  test('should remove pattern item and reoder the remaining items order and useOrder when useOrder was different', async () => {
    //given
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    const patternItemIdToRemove = randomUUID();
    const workoutSchedule = {
      id: workoutScheduleId,
      name: 'test schedule',
      userId: userId,
      isActive: false,
      setActiveDate: null,
      pattern: [
        {
          id: patternItemIdToRemove,
          order: 0,
          useOrder: 1,
          workoutTemplate: {
            id: randomUUID,
            userId: userId,
            name: 'template1',
            exercises: [],
          },
          restDays: 0,
        },
        {
          id: randomUUID(),
          order: 1,
          useOrder: 2,
          workoutTemplate: {
            id: randomUUID,
            userId: userId,
            name: 'template2',
            exercises: [],
          },
          restDays: 0,
        },
        {
          id: randomUUID(),
          order: 2,
          useOrder: 0,
          workoutTemplate: {
            id: randomUUID,
            userId: userId,
            name: 'template3',
            exercises: [],
          },
          restDays: 0,
        },
      ],
      lastOrder: null,
      lastFinishedWorkoutDate: null,
    };
    repository.get.mockResolvedValueOnce(workoutSchedule);
    //when
    const updatedWorkoutSchedule = await workoutScheduleService.removePatternItem(
      userId,
      workoutScheduleId,
      patternItemIdToRemove,
    );
    //then
    expect(repository.get).toHaveBeenCalledWith(workoutScheduleId, userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(updatedWorkoutSchedule.pattern).toHaveLength(2);
    expect(updatedWorkoutSchedule.pattern[0].order).toBe(0);
    expect(updatedWorkoutSchedule.pattern[0].useOrder).toBe(1);
    expect(updatedWorkoutSchedule.pattern[1].order).toBe(1);
    expect(updatedWorkoutSchedule.pattern[1].useOrder).toBe(0);
  });
});
