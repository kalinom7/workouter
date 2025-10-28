import { randomUUID } from 'node:crypto';
import { WorkoutScheduleService } from '../../../src/domain/workoutschedule/WorkoutScheduleService.js';
import { type WorkoutScheduleRepository } from '../../../src/domain/workoutschedule/WorkoutScheduleRepository.js';
import { createMock, type DeepMocked } from '@golevelup/ts-jest';

describe('WorkoutScheduleService', () => {
  let workoutScheduleService: WorkoutScheduleService;
  let repository: DeepMocked<WorkoutScheduleRepository>;

  beforeEach(() => {
    repository = createMock<WorkoutScheduleRepository>();
    workoutScheduleService = new WorkoutScheduleService(repository);
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
        block: [],
      }),
    );
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(createdWorkoutSchedule.id).toBeDefined();
    expect(createdWorkoutSchedule.name).toBe(workoutScheduleName);
    expect(createdWorkoutSchedule.userId).toBe(userId);
    expect(createdWorkoutSchedule.isActive).toBe(false);
    expect(createdWorkoutSchedule.block).toEqual([]);
  });
  test('should get workout schedule if it exists', async () => {
    //given
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    const workoutSchedule = {
      id: workoutScheduleId,
      name: 'test schedule',
      userId: userId,
      isActive: false,
      block: [],
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
      block: [],
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
  test('should add workout to block if workout schedule exists', async () => {
    //given
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    const workoutTemplateId = randomUUID();
    const workoutSchedule = {
      id: workoutScheduleId,
      name: 'test schedule',
      userId: userId,
      isActive: false,
      block: [],
    };
    repository.get.mockResolvedValueOnce(workoutSchedule);
    //when
    const updatedWorkoutSchedule = await workoutScheduleService.addWorkoutToBlock(
      workoutTemplateId,
      userId,
      workoutScheduleId,
    );
    //then
    expect(repository.get).toHaveBeenCalledWith(workoutScheduleId, userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(updatedWorkoutSchedule.block.length).toBe(1);
    expect(updatedWorkoutSchedule.block[0]).toEqual(
      expect.objectContaining({
        blockItemId: expect.any(String),
        type: 'workouttemplate',
        WorkoutTemplateId: workoutTemplateId,
      }),
    );
  });
  test('should throw error when trying to add workout to block of a workout schedule that does not exist', async () => {
    //given
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    const workoutTemplateId = randomUUID();
    repository.get.mockResolvedValueOnce(null);
    //when & then
    await expect(
      workoutScheduleService.addWorkoutToBlock(workoutTemplateId, userId, workoutScheduleId),
    ).rejects.toThrow('workout schedule not found');
    expect(repository.get).toHaveBeenCalledWith(workoutScheduleId, userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.save).not.toHaveBeenCalled();
  });
  test('should add rest to block if workout schedule exists', async () => {
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    const restPeriod = 24;
    const workoutSchedule = {
      id: workoutScheduleId,
      name: 'test schedule',
      userId: userId,
      isActive: false,
      block: [],
    };
    repository.get.mockResolvedValueOnce(workoutSchedule);
    //when
    const updatedWorkoutSchedule = await workoutScheduleService.addRestToBlock(restPeriod, userId, workoutScheduleId);
    //then
    expect(repository.get).toHaveBeenCalledWith(workoutScheduleId, userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(updatedWorkoutSchedule.block.length).toBe(1);
    expect(updatedWorkoutSchedule.block[0]).toEqual(
      expect.objectContaining({
        blockItemId: expect.any(String),
        type: 'rest',
        period: restPeriod,
      }),
    );
  });
  test('should throw error when trying to add rest to block of a workout schedule that does not exist', async () => {
    //given
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    const restPeriod = 24;
    repository.get.mockResolvedValueOnce(null);
    //when & then
    await expect(workoutScheduleService.addRestToBlock(restPeriod, userId, workoutScheduleId)).rejects.toThrow(
      'workout schedule not found',
    );
    expect(repository.get).toHaveBeenCalledWith(workoutScheduleId, userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.save).not.toHaveBeenCalled();
  });
  test('should remove block item if workout schedule and block item exist', async () => {
    //given
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    const blockItemId = randomUUID();
    const workoutSchedule = {
      id: workoutScheduleId,
      name: 'test schedule',
      userId: userId,
      isActive: false,
      block: [
        {
          blockItemId: blockItemId,
          type: 'rest' as const,
          period: 20,
        },
        {
          blockItemId: randomUUID(),
          type: 'rest' as const,
          period: 25,
        },
      ],
    };
    repository.get.mockResolvedValue(workoutSchedule);
    //when
    const updatedWorkoutSchedule = await workoutScheduleService.removeBlockItem(userId, workoutScheduleId, blockItemId);
    //then
    expect(repository.get).toHaveBeenCalledWith(workoutScheduleId, userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(updatedWorkoutSchedule.block.length).toBe(1);
  });
  test('should throw error when trying to remove block item from a workout schedule that does not exist', async () => {
    //given
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    const itemId = randomUUID();
    repository.get.mockResolvedValueOnce(null);
    //when & then
    await expect(workoutScheduleService.removeBlockItem(userId, workoutScheduleId, itemId)).rejects.toThrow(
      'workout schedule not found',
    );
    expect(repository.get).toHaveBeenCalledWith(workoutScheduleId, userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.save).not.toHaveBeenCalled();
  });
  test('should throw error when trying to remove block item that does not exist in the workout schedule', async () => {
    //given
    const mockItemId = randomUUID();
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    const workoutSchedule = {
      id: workoutScheduleId,
      name: 'test schedule',
      userId: userId,
      isActive: false,
      block: [],
    };
    repository.get.mockResolvedValueOnce(workoutSchedule);
    //when & then
    await expect(workoutScheduleService.removeBlockItem(userId, workoutScheduleId, mockItemId)).rejects.toThrow(
      'block item not found',
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
      block: [],
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
      block: [],
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
});
