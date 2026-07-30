import { createMock, type DeepMocked } from '@golevelup/ts-jest';
import { type WorkoutScheduleRepository } from '../../../src/domain/workoutschedule/WorkoutScheduleRepository';
import { WorkoutScheduleService } from '../../../src/domain/workoutschedule/WorkoutScheduleService';
import { WorkoutScheduleScheduledActivitySkippedException } from '../../../src/domain/workoutschedule/WorkoutScheduleExceptions';
import { randomUUID } from 'node:crypto';
import { jest } from '@jest/globals';
import { type WorkoutTemplateService } from '../../../src/domain/workouttemplate/WorkoutTemplateService';

describe('WorkoutScheduleService order', () => {
  let workoutScheduleService: WorkoutScheduleService;
  let workoutScheduleRepository: DeepMocked<WorkoutScheduleRepository>;
  let workoutTemplateService: DeepMocked<WorkoutTemplateService>;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-26T10:00:01Z'));

    workoutScheduleRepository = createMock<WorkoutScheduleRepository>();
    workoutTemplateService = createMock<WorkoutTemplateService>();
    workoutScheduleService = new WorkoutScheduleService(workoutScheduleRepository, workoutTemplateService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should update lastFinishedDate and lastFinishedOrder after first workout was finished', async () => {
    //given
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    const patternItemId = randomUUID();
    const workoutSchedule = {
      id: workoutScheduleId,
      name: 'test schedule',
      userId: userId,
      isActive: true,
      setActiveDate: new Date('2026-05-20T10:00:00Z'),
      pattern: [
        {
          id: patternItemId,
          order: 0,
          useOrder: 0,
          workoutTemplate: {
            id: randomUUID,
            userId: userId,
            name: 'template1',
            exercises: [],
          },
          restDays: 1,
        },
      ],
      lastOrder: null,
      lastFinishedWorkoutDate: null,
    };
    const finishedTime = new Date('2026-05-26T10:00:00Z');
    const finishedWorkoutTemplate = workoutSchedule.pattern[0].workoutTemplate;

    //when
    workoutScheduleRepository.get.mockResolvedValueOnce(workoutSchedule);
    const recalculatedWorkoutSchedule = await workoutScheduleService.update(
      workoutScheduleId,
      userId,
      finishedTime,
      finishedWorkoutTemplate.id,
    );

    //then
    expect(workoutScheduleRepository.get).toHaveBeenCalledWith(workoutScheduleId, userId);
    expect(workoutScheduleRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: workoutScheduleId,
        name: 'test schedule',
        userId: userId,
        isActive: true,
        setActiveDate: new Date('2026-05-20T10:00:00Z'),
        pattern: [
          {
            id: patternItemId,
            order: 0,
            useOrder: 0,
            workoutTemplate: finishedWorkoutTemplate,
            restDays: 1,
          },
        ],
        lastOrder: 0,
        lastFinishedWorkoutDate: finishedTime,
      }),
    );
    expect(recalculatedWorkoutSchedule.lastOrder).toBe(0);
    expect(recalculatedWorkoutSchedule.lastFinishedWorkoutDate).toEqual(finishedTime);
  });

  test('should get null as scheduled activity, current is restDay, activity wasnt skipped', async () => {
    //given
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    const patternItemId = randomUUID();
    const workoutSchedule = {
      id: workoutScheduleId,
      name: 'test schedule',
      userId: userId,
      isActive: true,
      setActiveDate: new Date('2026-05-20T10:00:00Z'),
      pattern: [
        {
          id: patternItemId,
          order: 0,
          useOrder: 0,
          workoutTemplate: {
            id: randomUUID,
            userId: userId,
            name: 'template1',
            exercises: [],
          },
          restDays: 1,
        },
      ],
      lastOrder: 0,
      lastFinishedWorkoutDate: new Date('2026-05-26T09:00:00Z'),
    };
    workoutScheduleRepository.getActive.mockResolvedValueOnce(workoutSchedule);
    //when
    const workoutTemplate = await workoutScheduleService.getScheduledActivity(userId);

    //then
    expect(workoutTemplate).toBeNull();
    expect(workoutScheduleRepository.getActive).toHaveBeenCalledWith(userId);
  });
  test('should get scheduled workoutTemplate as scheduled activity, current is workout, activity wasnt skipped', async () => {
    //given
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    const patternItemId1 = randomUUID();
    const patternItemId2 = randomUUID();
    const workoutTemplateId1 = randomUUID();
    const workoutTemplateId2 = randomUUID();
    const workoutSchedule = {
      id: workoutScheduleId,
      name: 'test schedule',
      userId: userId,
      isActive: true,
      setActiveDate: new Date('2026-05-20T10:00:00Z'),
      pattern: [
        {
          id: patternItemId1,
          order: 0,
          useOrder: 0,
          workoutTemplate: {
            id: workoutTemplateId1,
            userId: userId,
            name: 'template1',
            exercises: [],
          },
          restDays: 1,
        },
        {
          id: patternItemId2,
          order: 1,
          useOrder: 1,
          workoutTemplate: {
            id: workoutTemplateId2,
            userId: userId,
            name: 'template2',
            exercises: [],
          },
          restDays: 1,
        },
      ],
      lastOrder: 0,
      lastFinishedWorkoutDate: new Date('2026-05-25T10:00:00Z'),
    };
    workoutScheduleRepository.getActive.mockResolvedValueOnce(workoutSchedule);
    //when
    const workoutTemplate = await workoutScheduleService.getScheduledActivity(userId);

    //then
    expect(workoutTemplate).toEqual(workoutSchedule.pattern[1].workoutTemplate);
    expect(workoutScheduleRepository.getActive).toHaveBeenCalledWith(userId);
  });
  test('should throw error as scheduled activity, current is restDay, activity was skipped', async () => {
    //given
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    const patternItemId1 = randomUUID();
    const patternItemId2 = randomUUID();
    const workoutTemplateId1 = randomUUID();
    const workoutTemplateId2 = randomUUID();
    const workoutSchedule = {
      id: workoutScheduleId,
      name: 'test schedule',
      userId: userId,
      isActive: true,
      setActiveDate: new Date('2026-05-20T10:00:00Z'),
      pattern: [
        {
          id: patternItemId1,
          order: 0,
          useOrder: 0,
          workoutTemplate: {
            id: workoutTemplateId1,
            userId: userId,
            name: 'template 1',
            exercises: [],
          },
          restDays: 1,
        },
        {
          id: patternItemId2,
          order: 1,
          useOrder: 1,
          workoutTemplate: {
            id: workoutTemplateId2,
            userId: userId,
            name: 'template 2',
            exercises: [],
          },
          restDays: 1,
        },
      ],
      lastOrder: 0,
      lastFinishedWorkoutDate: new Date('2026-05-23T10:00:00Z'),
    };
    workoutScheduleRepository.getActive.mockResolvedValueOnce(workoutSchedule);

    //when && then
    await expect(workoutScheduleService.getScheduledActivity(userId)).rejects.toThrow(
      WorkoutScheduleScheduledActivitySkippedException,
    );
    expect(workoutScheduleRepository.getActive).toHaveBeenCalledWith(userId);
  });
  test('should throw error as scheduled activity, current is workout, activity was skipped', async () => {
    //given
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    const patternItemId1 = randomUUID();
    const patternItemId2 = randomUUID();
    const patternItemId3 = randomUUID();
    const workoutTemplateId1 = randomUUID();
    const workoutTemplateId2 = randomUUID();
    const workoutTemplateId3 = randomUUID();
    const workoutSchedule = {
      id: workoutScheduleId,
      name: 'test schedule',
      userId: userId,
      isActive: true,
      setActiveDate: new Date('2026-05-20T10:00:00Z'),
      pattern: [
        {
          id: patternItemId1,
          order: 0,
          useOrder: 0,
          workoutTemplate: {
            id: workoutTemplateId1,
            userId: userId,
            name: 'template2',
            exercises: [],
          },
          restDays: 1,
        },
        {
          id: patternItemId2,
          order: 1,
          useOrder: 1,
          workoutTemplate: {
            id: workoutTemplateId2,
            userId: userId,
            name: 'template2',
            exercises: [],
          },
          restDays: 1,
        },
        {
          id: patternItemId3,
          order: 2,
          useOrder: 2,
          workoutTemplate: {
            id: workoutTemplateId3,
            userId: userId,
            name: 'template3',
            exercises: [],
          },
          restDays: 1,
        },
      ],
      lastOrder: 0,
      lastFinishedWorkoutDate: new Date('2026-05-22T10:00:00Z'),
    };
    workoutScheduleRepository.getActive.mockResolvedValueOnce(workoutSchedule);

    //when && then
    await expect(workoutScheduleService.getScheduledActivity(userId)).rejects.toThrow(
      WorkoutScheduleScheduledActivitySkippedException,
    );
    expect(workoutScheduleRepository.getActive).toHaveBeenCalledWith(userId);
  });
  test('should update lastFinishedDate and lastFinishedOrder after workout was finished, activity was skipped', async () => {
    //given
    const userId = randomUUID();
    const workoutScheduleId = randomUUID();
    const patternItemId1 = randomUUID();
    const patternItemId2 = randomUUID();
    const patternItemId3 = randomUUID();
    const workoutTemplateId1 = randomUUID();
    const workoutTemplateId2 = randomUUID();
    const workoutTemplateId3 = randomUUID();
    const workoutSchedule = {
      id: workoutScheduleId,
      name: 'test schedule',
      userId: userId,
      isActive: true,
      setActiveDate: new Date('2026-05-20T10:00:00Z'),
      pattern: [
        {
          id: patternItemId1,
          order: 0,
          useOrder: 0,
          workoutTemplate: {
            id: workoutTemplateId1,
            userId: userId,
            name: 'template1',
            exercises: [],
          },
          restDays: 1,
        },
        {
          id: patternItemId2,
          order: 1,
          useOrder: 1,
          workoutTemplate: {
            id: workoutTemplateId2,
            userId: userId,
            name: 'template2',
            exercises: [],
          },
          restDays: 1,
        },
        {
          id: patternItemId3,
          order: 2,
          useOrder: 2,
          workoutTemplate: {
            id: workoutTemplateId3,
            userId: userId,
            name: 'template3',
            exercises: [],
          },
          restDays: 1,
        },
      ],
      lastOrder: 1,
      lastFinishedWorkoutDate: new Date('2026-05-22T10:00:00Z'),
    };
    workoutScheduleRepository.get.mockResolvedValueOnce(workoutSchedule);
    const finishedTime = new Date('2026-05-26T10:00:01Z');
    const finishedWorkoutTemplate = workoutSchedule.pattern[2].workoutTemplate;
    //when
    const recalculatedWorkoutSchedule = await workoutScheduleService.update(
      workoutScheduleId,
      userId,
      finishedTime,
      finishedWorkoutTemplate.id,
    );

    //then
    expect(workoutScheduleRepository.get).toHaveBeenCalledWith(workoutScheduleId, userId);
    expect(workoutScheduleRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: workoutScheduleId,
        name: 'test schedule',
        userId: userId,
        isActive: true,
        setActiveDate: new Date('2026-05-20T10:00:00Z'),
        pattern: [
          {
            id: patternItemId1,
            order: 0,
            useOrder: 0,
            workoutTemplate: {
              id: workoutTemplateId1,
              userId: userId,
              name: 'template1',
              exercises: [],
            },
            restDays: 1,
          },
          {
            id: patternItemId2,
            order: 1,
            useOrder: 1,
            workoutTemplate: {
              id: workoutTemplateId2,
              userId: userId,
              name: 'template2',
              exercises: [],
            },
            restDays: 1,
          },
          {
            id: patternItemId3,
            order: 2,
            useOrder: 2,
            workoutTemplate: finishedWorkoutTemplate,
            restDays: 1,
          },
        ],
        lastOrder: 2,
        lastFinishedWorkoutDate: finishedTime,
      }),
    );
    expect(recalculatedWorkoutSchedule.lastOrder).toBe(2);
    expect(recalculatedWorkoutSchedule.lastFinishedWorkoutDate).toEqual(finishedTime);
  });
});
