import { randomUUID, type UUID } from 'node:crypto';
import { WorkoutScheduleService } from '../../../src/domain/workoutschedule/WorkoutScheduleService.js';
import { type WorkoutScheduleRepository } from '../../../src/domain/workoutschedule/WorkoutScheduleRepository.js';
import { createMock, type DeepMocked } from '@golevelup/ts-jest';
import { type WorkoutRepository } from '../../../src/domain/workout/WorkoutRepository.js';
import { type WorkoutSchedule } from '../../../src/domain/workoutschedule/model/WorkoutSchedule.js';
import { type Workout } from '../../../src/domain/workout/model/Workout.js';

describe('WorkoutScheduleService', () => {
  let workoutScheduleService: WorkoutScheduleService;
  let repository: DeepMocked<WorkoutScheduleRepository>;
  let workoutRepository: DeepMocked<WorkoutRepository>;

  beforeEach(() => {
    repository = createMock<WorkoutScheduleRepository>();
    workoutRepository = createMock<WorkoutRepository>();
    workoutScheduleService = new WorkoutScheduleService(repository, workoutRepository);
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
      }),
    );
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(createdWorkoutSchedule.id).toBeDefined();
    expect(createdWorkoutSchedule.name).toBe(workoutScheduleName);
    expect(createdWorkoutSchedule.userId).toBe(userId);
    expect(createdWorkoutSchedule.isActive).toBe(false);
    expect(createdWorkoutSchedule.setActiveDate).toBe(null);

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
    await expect(workoutScheduleService.get(workoutScheduleId, userId)).rejects.toThrow('workout schedule not found');
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
      'workout schedule not found',
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
    };
    repository.get.mockResolvedValueOnce(workoutSchedule);
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
    expect(updatedWorkoutSchedule.pattern.length).toBe(1);
    expect(updatedWorkoutSchedule.pattern[0]).toEqual(
      expect.objectContaining({
        patternItemId: expect.any(String),
        order: 0,
        useOrder: 0,
        type: 'workout',
        workoutTemplateId: workoutTemplateId,
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
    ).rejects.toThrow('workout schedule not found');
    expect(repository.get).toHaveBeenCalledWith(workoutScheduleId, userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.save).not.toHaveBeenCalled();
  });
  test('should add rest to pattern if workout schedule exists', async () => {
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    const workoutSchedule = {
      id: workoutScheduleId,
      name: 'test schedule',
      userId: userId,
      isActive: false,
      setActiveDate: null,
      pattern: [],
    };
    repository.get.mockResolvedValueOnce(workoutSchedule);
    //when
    const updatedWorkoutSchedule = await workoutScheduleService.addRestToPattern(userId, workoutScheduleId);
    //then
    expect(repository.get).toHaveBeenCalledWith(workoutScheduleId, userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(updatedWorkoutSchedule.pattern.length).toBe(1);
    expect(updatedWorkoutSchedule.pattern[0]).toEqual(
      expect.objectContaining({
        patternItemId: expect.any(String),
        order: 0,
        useOrder: 0,
        type: 'rest',
        workoutTemplateId: null,
      }),
    );
  });
  test('should throw error when trying to add rest to pattern of a workout schedule that does not exist', async () => {
    //given
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    repository.get.mockResolvedValueOnce(null);
    //when & then
    await expect(workoutScheduleService.addRestToPattern(userId, workoutScheduleId)).rejects.toThrow(
      'workout schedule not found',
    );
    expect(repository.get).toHaveBeenCalledWith(workoutScheduleId, userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.save).not.toHaveBeenCalled();
  });
  test('should remove pattern item if workout schedule and pattern item exist', async () => {
    //given
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    const patternItemId = randomUUID();
    const workoutSchedule = {
      id: workoutScheduleId,
      name: 'test schedule',
      userId: userId,
      isActive: false,
      setActiveDate: null,
      pattern: [
        {
          patternItemId: patternItemId,
          order: 0,
          useOrder: 0,
          type: 'rest' as const,
          workoutTemplateId: null,
        },
        {
          patternItemId: randomUUID(),
          order: 1,
          useOrder: 1,
          type: 'rest' as const,
          workoutTemplateId: null,
        },
      ],
    };
    repository.get.mockResolvedValue(workoutSchedule);
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
    expect(updatedWorkoutSchedule.pattern.length).toBe(1);
  });
  test('should throw error when trying to remove pattern item from a workout schedule that does not exist', async () => {
    //given
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    const itemId = randomUUID();
    repository.get.mockResolvedValueOnce(null);
    //when & then
    await expect(workoutScheduleService.removePatternItem(userId, workoutScheduleId, itemId)).rejects.toThrow(
      'workout schedule not found',
    );
    expect(repository.get).toHaveBeenCalledWith(workoutScheduleId, userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.save).not.toHaveBeenCalled();
  });
  test('should throw error when trying to remove pattern item that does not exist in the workout schedule', async () => {
    //given
    const mockItemId = randomUUID();
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    const workoutSchedule = {
      id: workoutScheduleId,
      name: 'test schedule',
      userId: userId,
      isActive: false,
      setActiveDate: null,
      pattern: [],
    };
    repository.get.mockResolvedValueOnce(workoutSchedule);
    //when & then
    await expect(workoutScheduleService.removePatternItem(userId, workoutScheduleId, mockItemId)).rejects.toThrow(
      'Pattern item not found',
    );
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
    };
    repository.get.mockResolvedValueOnce(workoutSchedule);
    //when
    const updatedWorkoutSchedule = await workoutScheduleService.setActive(workoutSchedule.id, workoutSchedule.userId);
    //then
    expect(repository.get).toHaveBeenCalledWith(workoutSchedule.id, workoutSchedule.userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(updatedWorkoutSchedule.isActive).toBe(true);
  });
  test('should throw error when trying to set workout schedule as active if it does not exist', async () => {
    //given
    const workoutScheduleId = randomUUID();
    const userId = randomUUID();
    repository.get.mockResolvedValueOnce(null);
    //when & then
    await expect(workoutScheduleService.setActive(workoutScheduleId, userId)).rejects.toThrow(
      'workout schedule not found',
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
  test('should adjust pattern order of workout schedule if it exists', async () => {
    //given

    const templateId1 = randomUUID();
    const templateId2 = randomUUID();
    const templateId3 = randomUUID();
    const workoutSchedule: WorkoutSchedule = {
      id: randomUUID() as UUID,
      name: 'test schedule',
      userId: randomUUID() as UUID,
      isActive: false,
      setActiveDate: new Date('2023-01-01T10:00:00Z'),
      pattern: [
        {
          patternItemId: randomUUID() as UUID,
          order: 0,
          useOrder: 0,
          type: 'workout',
          workoutTemplateId: templateId1,
        },
        {
          patternItemId: randomUUID() as UUID,
          order: 1,
          useOrder: 1,
          type: 'workout',
          workoutTemplateId: templateId2,
        },
        {
          patternItemId: randomUUID() as UUID,
          order: 2,
          useOrder: 2,
          type: 'workout',
          workoutTemplateId: templateId3,
        },
      ],
    };
    repository.get.mockResolvedValueOnce(workoutSchedule);
    workoutRepository.findLastFinishedFromTemplate.mockResolvedValueOnce(templateId1);
    //when
    const updatedWorkoutSchedule = await workoutScheduleService.adjustPatternOrder(
      workoutSchedule.id,
      workoutSchedule.userId,
    );
    //then
    expect(repository.get).toHaveBeenCalledWith(workoutSchedule.id, workoutSchedule.userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(workoutRepository.findLastFinishedFromTemplate).toHaveBeenCalledWith(
      workoutSchedule.userId,
      [templateId1, templateId2, templateId3],
      expect.any(Date),
    );
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(updatedWorkoutSchedule.pattern[0].workoutTemplateId).toBe(templateId1);
    expect(updatedWorkoutSchedule.pattern[1].workoutTemplateId).toBe(templateId2);
    expect(updatedWorkoutSchedule.pattern[2].workoutTemplateId).toBe(templateId3);
    expect(updatedWorkoutSchedule.pattern[0].useOrder).toBe(2);
    expect(updatedWorkoutSchedule.pattern[1].useOrder).toBe(0);
    expect(updatedWorkoutSchedule.pattern[2].useOrder).toBe(1);
  });
});
