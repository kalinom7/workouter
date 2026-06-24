import { randomUUID } from 'node:crypto';
import { WorkoutScheduleService } from '../../../src/domain/workoutschedule/WorkoutScheduleService.js';
import { type WorkoutScheduleRepository } from '../../../src/domain/workoutschedule/WorkoutScheduleRepository.js';
import { createMock, type DeepMocked } from '@golevelup/ts-jest';
import { type WorkoutSchedule } from '../../../src/domain/workoutschedule/model/WorkoutSchedule.js';

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
      lastOrder: null,
      lastFinishedWorkoutDate: null,
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
        workoutTemplateId: workoutTemplateId,
        restDays: 0,
      }),
    );
  });

  test('should add rest to workout in pattern if they exist', async () => {
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
          workoutTemplateId: randomUUID(),
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
    expect(updatedWorkoutSchedule.pattern.length).toBe(1);
    expect(updatedWorkoutSchedule.pattern[0]).toEqual(
      expect.objectContaining({
        patternItemId: workoutSchedule.pattern[0].patternItemId,
        order: 0,
        useOrder: 0,
        workoutTemplateId: workoutSchedule.pattern[0].workoutTemplateId,
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
    ).rejects.toThrow('workout schedule not found');
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
});
