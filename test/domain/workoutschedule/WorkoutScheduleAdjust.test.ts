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

  test('should simply adjust order after scheduled workout was found finished', async () => {
    //given
    const templateId1 = randomUUID();
    const templateId2 = randomUUID();
    const templateId3 = randomUUID();
    const foundFinishedWorkout: Workout = {
      id: randomUUID(),
      userId: randomUUID(),
      startTime: new Date('2026-04-05T10:00:00Z'),
      usedWorkoutTemplate: templateId1,
      endTime: new Date('2026-04-05T11:00:00Z'),
      exercises: [],
    };
    const workoutSchedule: WorkoutSchedule = {
      id: randomUUID() as UUID,
      name: 'test schedule',
      userId: randomUUID() as UUID,
      isActive: false,
      setActiveDate: new Date('2026-01-01T10:00:00Z'),
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
    workoutRepository.findLastFinishedFromPattern.mockResolvedValueOnce(foundFinishedWorkout);

    //when
    const updatedWorkoutSchedule = await workoutScheduleService.adjustPatternOrder(
      workoutSchedule.id,
      workoutSchedule.userId,
    );

    //then
    expect(repository.get).toHaveBeenCalledWith(workoutSchedule.id, workoutSchedule.userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(workoutRepository.findLastFinishedFromPattern).toHaveBeenCalledWith(
      workoutSchedule.userId,
      [templateId1, templateId2, templateId3],
      expect.any(Date),
    );
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(updatedWorkoutSchedule.pattern[0].order).toBe(0);
    expect(updatedWorkoutSchedule.pattern[1].order).toBe(1);
    expect(updatedWorkoutSchedule.pattern[2].order).toBe(2);
    expect(updatedWorkoutSchedule.pattern[0].workoutTemplateId).toBe(templateId1);
    expect(updatedWorkoutSchedule.pattern[1].workoutTemplateId).toBe(templateId2);
    expect(updatedWorkoutSchedule.pattern[2].workoutTemplateId).toBe(templateId3);
    expect(updatedWorkoutSchedule.pattern[0].useOrder).toBe(2);
    expect(updatedWorkoutSchedule.pattern[1].useOrder).toBe(0);
    expect(updatedWorkoutSchedule.pattern[2].useOrder).toBe(1);
  });
  test('should adjust pattern order of workout schedule twice if it exists', async () => {
    //given

    const templateId1 = randomUUID();
    const foundFinishedWorkoutFirst: Workout = {
      id: randomUUID(),
      userId: randomUUID(),
      startTime: new Date('2026-04-05T10:00:00Z'),
      usedWorkoutTemplate: templateId1,
      endTime: new Date('2026-04-05T11:00:00Z'),
      exercises: [],
    };

    const templateId2 = randomUUID();
    const foundFinishedWorkoutSecond: Workout = {
      id: randomUUID(),
      userId: randomUUID(),
      startTime: new Date('2026-05-05T10:00:00Z'),
      usedWorkoutTemplate: templateId2,
      endTime: new Date('2026-05-05T11:00:00Z'),
      exercises: [],
    };
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
          type: 'rest',
          workoutTemplateId: null,
        },
      ],
    };
    repository.get.mockResolvedValueOnce(workoutSchedule);
    workoutRepository.findLastFinishedFromPattern.mockResolvedValueOnce(foundFinishedWorkoutFirst);
    //when
    const updatedWorkoutSchedule = await workoutScheduleService.adjustPatternOrder(
      workoutSchedule.id,
      workoutSchedule.userId,
    );
    //when second adjust
    repository.get.mockResolvedValueOnce(updatedWorkoutSchedule);
    workoutRepository.findLastFinishedFromPattern.mockResolvedValueOnce(foundFinishedWorkoutSecond);
    const secondUpdatedWorkoutSchedule = await workoutScheduleService.adjustPatternOrder(
      workoutSchedule.id,
      workoutSchedule.userId,
    );
    //then
    expect(repository.get).toHaveBeenCalledWith(workoutSchedule.id, workoutSchedule.userId);
    expect(repository.get).toHaveBeenCalledTimes(2);
    expect(workoutRepository.findLastFinishedFromPattern).toHaveBeenCalledWith(
      workoutSchedule.userId,
      [templateId1, templateId2],
      expect.any(Date),
    );
    expect(repository.save).toHaveBeenCalledTimes(2);
    expect(secondUpdatedWorkoutSchedule.pattern[0].order).toBe(0);
    expect(secondUpdatedWorkoutSchedule.pattern[1].order).toBe(1);
    expect(secondUpdatedWorkoutSchedule.pattern[2].order).toBe(2);
    expect(secondUpdatedWorkoutSchedule.pattern[0].workoutTemplateId).toBe(templateId1);
    expect(secondUpdatedWorkoutSchedule.pattern[1].workoutTemplateId).toBe(templateId2);
    expect(secondUpdatedWorkoutSchedule.pattern[2].workoutTemplateId).toBe(null);

    expect(secondUpdatedWorkoutSchedule.pattern[0].useOrder).toBe(1);
    expect(secondUpdatedWorkoutSchedule.pattern[1].useOrder).toBe(2);
    expect(secondUpdatedWorkoutSchedule.pattern[2].useOrder).toBe(0);
  });

  test('should adjust pattern order of workout schedule if workout was skipped', async () => {
    //given

    const templateId1 = randomUUID();
    const templateId2 = randomUUID();
    const foundFinishedWorkoutSecond: Workout = {
      id: randomUUID(),
      userId: randomUUID(),
      startTime: new Date('2026-05-05T10:00:00Z'),
      usedWorkoutTemplate: templateId2,
      endTime: new Date('2026-05-05T11:00:00Z'),
      exercises: [],
    };
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

    //user skipped templateId1 and went straight to templateId2
    //so the order should be: templateId3: 0; templateId1: 1; templateId2: 2;

    workoutRepository.findLastFinishedFromPattern.mockResolvedValueOnce(foundFinishedWorkoutSecond);
    //when
    const updatedWorkoutSchedule = await workoutScheduleService.adjustPatternOrder(
      workoutSchedule.id,
      workoutSchedule.userId,
    );
    //then
    expect(repository.get).toHaveBeenCalledWith(workoutSchedule.id, workoutSchedule.userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(workoutRepository.findLastFinishedFromPattern).toHaveBeenCalledWith(
      workoutSchedule.userId,
      [templateId1, templateId2, templateId3],
      expect.any(Date),
    );
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(updatedWorkoutSchedule.pattern[0].order).toBe(0);
    expect(updatedWorkoutSchedule.pattern[1].order).toBe(1);
    expect(updatedWorkoutSchedule.pattern[2].order).toBe(2);
    expect(updatedWorkoutSchedule.pattern[0].workoutTemplateId).toBe(templateId1);
    expect(updatedWorkoutSchedule.pattern[1].workoutTemplateId).toBe(templateId2);
    expect(updatedWorkoutSchedule.pattern[2].workoutTemplateId).toBe(templateId3);
    expect(updatedWorkoutSchedule.pattern[0].useOrder).toBe(1);
    expect(updatedWorkoutSchedule.pattern[1].useOrder).toBe(2);
    expect(updatedWorkoutSchedule.pattern[2].useOrder).toBe(0);
  });

  test('shouldnt pass over next workout if daysDiff is more than restDays', async () => {
    //given
    const templateId1 = randomUUID();
    const templateId2 = randomUUID();

    /* today = 07.05; workout finished 04.05;
     * last finished workout is workout with template2 so the next item for user was restDay
     * Days passed don't skip workouts in schedule, if a lot of days passed they
     * stop at scheduling first workout that comes in pattern.
     */
    const foundFinishedWorkout: Workout = {
      id: randomUUID(),
      userId: randomUUID(),
      startTime: new Date('2026-04-05T10:00:00Z'),
      usedWorkoutTemplate: templateId2,
      endTime: new Date('2026-05-02T11:00:00Z'),
      exercises: [],
    };
    const workoutSchedule: WorkoutSchedule = {
      id: randomUUID() as UUID,
      name: 'test schedule',
      userId: randomUUID() as UUID,
      isActive: false,
      setActiveDate: new Date('2026-01-01T10:00:00Z'),
      pattern: [
        {
          patternItemId: randomUUID() as UUID,
          order: 0,
          useOrder: 3,
          type: 'workout',
          workoutTemplateId: templateId1,
        },
        {
          patternItemId: randomUUID() as UUID,
          order: 1,
          useOrder: 4,
          type: 'workout',
          workoutTemplateId: templateId2,
        },
        {
          patternItemId: randomUUID() as UUID,
          order: 2,
          useOrder: 0,
          type: 'rest',
          workoutTemplateId: null,
        },
        {
          patternItemId: randomUUID() as UUID,
          order: 3,
          useOrder: 1,
          type: 'rest',
          workoutTemplateId: null,
        },
        {
          patternItemId: randomUUID() as UUID,
          order: 4,
          useOrder: 2,
          type: 'rest',
          workoutTemplateId: null,
        },
      ],
    };
    repository.get.mockResolvedValueOnce(workoutSchedule);
    workoutRepository.findLastFinishedFromPattern.mockResolvedValueOnce(foundFinishedWorkout);

    //when
    const updatedWorkoutSchedule = await workoutScheduleService.adjustPatternOrder(
      workoutSchedule.id,
      workoutSchedule.userId,
    );

    //then
    expect(repository.get).toHaveBeenCalledWith(workoutSchedule.id, workoutSchedule.userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(workoutRepository.findLastFinishedFromPattern).toHaveBeenCalledWith(
      workoutSchedule.userId,
      [templateId1, templateId2],
      expect.any(Date),
    );
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(updatedWorkoutSchedule.pattern[0].order).toBe(0);
    expect(updatedWorkoutSchedule.pattern[1].order).toBe(1);
    expect(updatedWorkoutSchedule.pattern[2].order).toBe(2);
    expect(updatedWorkoutSchedule.pattern[3].order).toBe(3);

    expect(updatedWorkoutSchedule.pattern[0].workoutTemplateId).toBe(templateId1);
    expect(updatedWorkoutSchedule.pattern[1].workoutTemplateId).toBe(templateId2);
    expect(updatedWorkoutSchedule.pattern[2].workoutTemplateId).toBe(null);
    expect(updatedWorkoutSchedule.pattern[3].workoutTemplateId).toBe(null);

    expect(updatedWorkoutSchedule.pattern[0].useOrder).toBe(0);
    expect(updatedWorkoutSchedule.pattern[1].useOrder).toBe(1);
    expect(updatedWorkoutSchedule.pattern[2].useOrder).toBe(2);
    expect(updatedWorkoutSchedule.pattern[3].useOrder).toBe(3);
    expect(updatedWorkoutSchedule.pattern[4].useOrder).toBe(4);
  });

  test('should adjust order to patternItem after lastDoneWorkout for daysDiff 0', async () => {
    /**
     * currentItem was restDay after workout templateId2
     * but suddenly workout templateId1 was done
     * so currentItem should calculate shift in reference to templateId1
     * depending on what is the next item after workout templateId1 or how many days
     * passed currentItem should be some calculated item after templateId1
     * test passed done for daysDiff = 0
     */

    //given
    const templateId1 = randomUUID();
    const templateId2 = randomUUID();

    const foundFinishedWorkout: Workout = {
      id: randomUUID(),
      userId: randomUUID(),
      startTime: new Date('2026-04-05T10:00:00Z'),
      usedWorkoutTemplate: templateId1,
      endTime: new Date('2026-05-10T11:00:00Z'),
      exercises: [],
    };
    const workoutSchedule: WorkoutSchedule = {
      id: randomUUID() as UUID,
      name: 'test schedule',
      userId: randomUUID() as UUID,
      isActive: false,
      setActiveDate: new Date('2026-01-01T10:00:00Z'),
      pattern: [
        {
          patternItemId: randomUUID() as UUID,
          order: 0,
          useOrder: 1,
          type: 'workout',
          workoutTemplateId: templateId1,
        },
        {
          patternItemId: randomUUID() as UUID,
          order: 1,
          useOrder: 2,
          type: 'rest',
          workoutTemplateId: null,
        },
        {
          patternItemId: randomUUID() as UUID,
          order: 2,
          useOrder: 3,
          type: 'rest',
          workoutTemplateId: null,
        },
        {
          patternItemId: randomUUID() as UUID,
          order: 3,
          useOrder: 4,
          type: 'workout',
          workoutTemplateId: templateId2,
        },
        {
          patternItemId: randomUUID() as UUID,
          order: 4,
          useOrder: 0,
          type: 'rest',
          workoutTemplateId: null,
        },
      ],
    };
    repository.get.mockResolvedValueOnce(workoutSchedule);
    workoutRepository.findLastFinishedFromPattern.mockResolvedValueOnce(foundFinishedWorkout);

    //when
    const updatedWorkoutSchedule = await workoutScheduleService.adjustPatternOrder(
      workoutSchedule.id,
      workoutSchedule.userId,
    );

    //then
    expect(repository.get).toHaveBeenCalledWith(workoutSchedule.id, workoutSchedule.userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(workoutRepository.findLastFinishedFromPattern).toHaveBeenCalledWith(
      workoutSchedule.userId,
      [templateId1, templateId2],
      expect.any(Date),
    );
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(updatedWorkoutSchedule.pattern[0].order).toBe(0);
    expect(updatedWorkoutSchedule.pattern[1].order).toBe(1);
    expect(updatedWorkoutSchedule.pattern[2].order).toBe(2);
    expect(updatedWorkoutSchedule.pattern[3].order).toBe(3);

    expect(updatedWorkoutSchedule.pattern[0].useOrder).toBe(4);
    expect(updatedWorkoutSchedule.pattern[1].useOrder).toBe(0);
    expect(updatedWorkoutSchedule.pattern[2].useOrder).toBe(1);
    expect(updatedWorkoutSchedule.pattern[3].useOrder).toBe(2);
    expect(updatedWorkoutSchedule.pattern[4].useOrder).toBe(3);
  });

  test('should adjust order for one workout workoutSchedule for daysDiff=1', async () => {
    /**
     * test is for one workout schedule, for example FBW workout once with 2 restDays
     */

    //given
    const templateId1 = randomUUID();

    const foundFinishedWorkout: Workout = {
      id: randomUUID(),
      userId: randomUUID(),
      startTime: new Date('2026-04-05T10:00:00Z'),
      usedWorkoutTemplate: templateId1,
      endTime: new Date('2026-05-09T11:00:00Z'),
      exercises: [],
    };
    const workoutSchedule: WorkoutSchedule = {
      id: randomUUID() as UUID,
      name: 'test schedule',
      userId: randomUUID() as UUID,
      isActive: false,
      setActiveDate: new Date('2026-01-01T10:00:00Z'),
      pattern: [
        {
          patternItemId: randomUUID() as UUID,
          order: 0,
          useOrder: 2,
          type: 'workout',
          workoutTemplateId: templateId1,
        },
        {
          patternItemId: randomUUID() as UUID,
          order: 1,
          useOrder: 0,
          type: 'rest',
          workoutTemplateId: null,
        },
        {
          patternItemId: randomUUID() as UUID,
          order: 2,
          useOrder: 1,
          type: 'rest',
          workoutTemplateId: null,
        },
      ],
    };
    repository.get.mockResolvedValueOnce(workoutSchedule);
    workoutRepository.findLastFinishedFromPattern.mockResolvedValueOnce(foundFinishedWorkout);

    //when
    const updatedWorkoutSchedule = await workoutScheduleService.adjustPatternOrder(
      workoutSchedule.id,
      workoutSchedule.userId,
    );

    //then

    expect(repository.get).toHaveBeenCalledWith(workoutSchedule.id, workoutSchedule.userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(workoutRepository.findLastFinishedFromPattern).toHaveBeenCalledWith(
      workoutSchedule.userId,
      [templateId1],
      expect.any(Date),
    );
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(updatedWorkoutSchedule.pattern[0].order).toBe(0);
    expect(updatedWorkoutSchedule.pattern[1].order).toBe(1);
    expect(updatedWorkoutSchedule.pattern[2].order).toBe(2);

    expect(updatedWorkoutSchedule.pattern[0].useOrder).toBe(1);
    expect(updatedWorkoutSchedule.pattern[1].useOrder).toBe(2);
    expect(updatedWorkoutSchedule.pattern[2].useOrder).toBe(0);
  });

  test('should adjust order for one workout workoutSchedule for daysDiff=2', async () => {
    /**
     * test is for one workout schedule, for example FBW workout once with 2 restDays
     */

    //given
    const templateId1 = randomUUID();

    const foundFinishedWorkout: Workout = {
      id: randomUUID(),
      userId: randomUUID(),
      startTime: new Date('2026-04-05T10:00:00Z'),
      usedWorkoutTemplate: templateId1,
      endTime: new Date('2026-05-08T11:00:00Z'),
      exercises: [],
    };
    const workoutSchedule: WorkoutSchedule = {
      id: randomUUID() as UUID,
      name: 'test schedule',
      userId: randomUUID() as UUID,
      isActive: false,
      setActiveDate: new Date('2026-01-01T10:00:00Z'),
      pattern: [
        {
          patternItemId: randomUUID() as UUID,
          order: 0,
          useOrder: 2,
          type: 'workout',
          workoutTemplateId: templateId1,
        },
        {
          patternItemId: randomUUID() as UUID,
          order: 1,
          useOrder: 0,
          type: 'rest',
          workoutTemplateId: null,
        },
        {
          patternItemId: randomUUID() as UUID,
          order: 2,
          useOrder: 1,
          type: 'rest',
          workoutTemplateId: null,
        },
      ],
    };
    repository.get.mockResolvedValueOnce(workoutSchedule);
    workoutRepository.findLastFinishedFromPattern.mockResolvedValueOnce(foundFinishedWorkout);

    //when
    const updatedWorkoutSchedule = await workoutScheduleService.adjustPatternOrder(
      workoutSchedule.id,
      workoutSchedule.userId,
    );

    //then

    expect(repository.get).toHaveBeenCalledWith(workoutSchedule.id, workoutSchedule.userId);
    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(workoutRepository.findLastFinishedFromPattern).toHaveBeenCalledWith(
      workoutSchedule.userId,
      [templateId1],
      expect.any(Date),
    );
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(updatedWorkoutSchedule.pattern[0].order).toBe(0);
    expect(updatedWorkoutSchedule.pattern[1].order).toBe(1);
    expect(updatedWorkoutSchedule.pattern[2].order).toBe(2);

    expect(updatedWorkoutSchedule.pattern[0].useOrder).toBe(0);
    expect(updatedWorkoutSchedule.pattern[1].useOrder).toBe(1);
    expect(updatedWorkoutSchedule.pattern[2].useOrder).toBe(2);
  });
});
