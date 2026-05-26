import { createMock, type DeepMocked } from '@golevelup/ts-jest';
import { type WorkoutScheduleRepository } from '../../../src/domain/workoutschedule/WorkoutScheduleRepository';
import { WorkoutScheduleService } from '../../../src/domain/workoutschedule/WorkoutScheduleService';
import { randomUUID } from 'node:crypto';
import { jest } from '@jest/globals';

describe('WorkoutScheduleService order', () => {
  let workoutScheduleService: WorkoutScheduleService;
  let workoutScheduleRepository: DeepMocked<WorkoutScheduleRepository>;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-26T10:00:01Z'));

    workoutScheduleRepository = createMock<WorkoutScheduleRepository>();
    workoutScheduleService = new WorkoutScheduleService(workoutScheduleRepository);
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
          patternItemId: patternItemId,
          order: 0,
          useOrder: 0,
          workoutTemplateId: randomUUID(),
          restDays: 1,
        },
      ],
      lastOrder: null,
      lastFinishedWorkoutDate: null,
    };
    const finishedTime = new Date('2026-05-26T10:00:00Z');
    const finishedWorkoutTemplateId = workoutSchedule.pattern[0].workoutTemplateId;

    //when
    workoutScheduleRepository.get.mockResolvedValueOnce(workoutSchedule);
    const recalculatedWorkoutSchedule = await workoutScheduleService.update(
      workoutScheduleId,
      userId,
      finishedTime,
      finishedWorkoutTemplateId,
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
            patternItemId: patternItemId,
            order: 0,
            useOrder: 0,
            workoutTemplateId: finishedWorkoutTemplateId,
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
          patternItemId: patternItemId,
          order: 0,
          useOrder: 0,
          workoutTemplateId: randomUUID(),
          restDays: 1,
        },
      ],
      lastOrder: 0,
      lastFinishedWorkoutDate: new Date('2026-05-26T09:00:00Z'),
    };
    workoutScheduleRepository.get.mockResolvedValueOnce(workoutSchedule);
    //when
    const workoutTemplate = await workoutScheduleService.getScheduledActivity(workoutScheduleId, userId);

    //then
    expect(workoutTemplate).toBeNull();
    expect(workoutScheduleRepository.get).toHaveBeenCalledWith(workoutScheduleId, userId);
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
          patternItemId: patternItemId1,
          order: 0,
          useOrder: 0,
          workoutTemplateId: workoutTemplateId1,
          restDays: 1,
        },
        {
          patternItemId: patternItemId2,
          order: 1,
          useOrder: 1,
          workoutTemplateId: workoutTemplateId2,
          restDays: 1,
        },
      ],
      lastOrder: 0,
      lastFinishedWorkoutDate: new Date('2026-05-25T10:00:00Z'),
    };
    workoutScheduleRepository.get.mockResolvedValueOnce(workoutSchedule);
    //when
    const workoutTemplate = await workoutScheduleService.getScheduledActivity(workoutScheduleId, userId);

    //then
    expect(workoutTemplate).toEqual(workoutTemplateId2);
    expect(workoutScheduleRepository.get).toHaveBeenCalledWith(workoutScheduleId, userId);
  });
});
