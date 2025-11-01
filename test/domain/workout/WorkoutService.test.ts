import { randomUUID } from 'node:crypto';
import { type Workout } from '../../../src/domain/workout/model/Workout.js';
import { type WorkoutRepository } from '../../../src/domain/workout/WorkoutRepository.js';
import { type WorkoutTemplateService } from '../../../src/domain/workouttemplate/WorkoutTemplateService.js';
import { type ExerciseService } from '../../../src/domain/exercise/ExerciseService.js';
import { createMock, type DeepMocked } from '@golevelup/ts-jest';
import { WorkoutService } from '../../../src/domain/workout/WorkoutService.js';

describe('WorkoutService', () => {
  let workoutService: WorkoutService;
  let repository: DeepMocked<WorkoutRepository>;
  let workoutTemplateService: DeepMocked<WorkoutTemplateService>;
  let exerciseService: DeepMocked<ExerciseService>;

  beforeEach(() => {
    repository = createMock<WorkoutRepository>();
    workoutTemplateService = createMock<WorkoutTemplateService>();
    exerciseService = createMock<ExerciseService>();

    workoutService = new WorkoutService(repository, workoutTemplateService, exerciseService);
  });
  test('should start workout from template', async () => {
    // given
    const userId = randomUUID();
    const workoutTemplateId = randomUUID();
    const startTime = new Date();

    workoutTemplateService.getWorkoutTemplate.mockResolvedValue({
      id: workoutTemplateId,
      userId,
      name: 'Test Template',
      exercises: [
        { exercise: randomUUID(), sets: 3, restPeriod: 60, order: 0 },
        { exercise: randomUUID(), sets: 4, restPeriod: 90, order: 1 },
      ],
    });

    // when
    const workout = await workoutService.startWorkoutFromTemplate(startTime, userId, workoutTemplateId);

    // then
    expect(workout).toBeDefined();
    expect(workout.exercises).toHaveLength(2);
    expect(workout.exercises[0].sets).toHaveLength(3);
    expect(workout.exercises[1].sets).toHaveLength(4);
    expect(repository.save).toHaveBeenCalledWith(workout);
  });
  test('should throw error when trying to start workout from non-existing template', async () => {
    //given
    const userId = randomUUID();
    const workoutTemplateId = randomUUID();
    const startTime = new Date();
    workoutTemplateService.getWorkoutTemplate.mockRejectedValue(new Error('WorkoutTemplate not found'));

    //when & then
    await expect(workoutService.startWorkoutFromTemplate(startTime, userId, workoutTemplateId)).rejects.toThrow(
      'WorkoutTemplate not found',
    );
    expect(repository.save).not.toHaveBeenCalled();
    expect(workoutTemplateService.getWorkoutTemplate).toHaveBeenCalledWith(workoutTemplateId, userId);
  });
  test('should start empty workout', async () => {
    //given
    const userId = randomUUID();
    const startTime = new Date();

    //when
    const workout = await workoutService.StartEmptyWorkout(startTime, userId);

    //then
    expect(workout).toBeDefined();
    expect(workout.exercises).toHaveLength(0);
    expect(repository.save).toHaveBeenCalledWith(workout);
  });
  test('should add exercise to workout', async () => {
    //given
    const userId = randomUUID();
    const workoutId = randomUUID();
    const exerciseId = randomUUID();

    const existingWorkout: Workout = {
      id: workoutId,
      userId,
      startTime: new Date(),
      endTime: null,
      exercises: [],
    };

    repository.get.mockResolvedValue(existingWorkout);
    exerciseService.get.mockResolvedValue({
      id: exerciseId,
      userId: userId,
      name: 'Test Exercise',
      description: 'test Description',
    });
    //when
    await workoutService.addExercise(userId, workoutId, exerciseId);
    const savedWorkout = repository.save.mock.calls[0][0];
    //then
    expect(repository.get).toHaveBeenCalledWith(workoutId, userId);
    expect(exerciseService.get).toHaveBeenCalledWith(exerciseId, userId);
    expect(repository.save).toHaveBeenCalled();
    expect(savedWorkout.exercises).toHaveLength(1);
    expect(savedWorkout.exercises[0].exerciseId).toBe(exerciseId);
  });
  test('should throw error when adding exercise to non-existing workout', async () => {
    //given
    const userId = randomUUID();
    const workoutId = randomUUID();
    const exerciseId = randomUUID();

    repository.get.mockResolvedValue(null);

    //when & then
    await expect(workoutService.addExercise(userId, workoutId, exerciseId)).rejects.toThrow('Workout not found');
    expect(repository.get).toHaveBeenCalledWith(workoutId, userId);
    expect(exerciseService.get).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
  });
  test('should remove exercise from workout', async () => {
    //given
    const userId = randomUUID();
    const workoutId = randomUUID();

    const existingWorkout: Workout = {
      id: workoutId,
      userId,
      startTime: new Date(),
      endTime: null,
      exercises: [
        { exerciseId: randomUUID(), sets: [], order: 0, isCompleted: false },
        { exerciseId: randomUUID(), sets: [], order: 1, isCompleted: false },
      ],
    };
    repository.get.mockResolvedValue(existingWorkout);

    //when
    await workoutService.removeExercise(userId, workoutId, 0);
    const savedWorkout = repository.save.mock.calls[0][0];

    //then
    expect(repository.get).toHaveBeenCalledWith(workoutId, userId);
    expect(repository.save).toHaveBeenCalled();
    expect(savedWorkout.exercises).toHaveLength(1);
    expect(savedWorkout.exercises[0].order).toBe(0);
    expect(existingWorkout.startTime).toEqual(savedWorkout.startTime);
  });
  test('should throw error when removing exercise from non-existing workout', async () => {
    //given
    const userId = randomUUID();
    const workoutId = randomUUID();

    repository.get.mockResolvedValue(null);

    //when & then
    await expect(workoutService.removeExercise(userId, workoutId, 0)).rejects.toThrow('Workout not found');
    expect(repository.get).toHaveBeenCalledWith(workoutId, userId);
    expect(repository.save).not.toHaveBeenCalled();
  });
  test('should throw error when removing non-existing exercise from workout', async () => {
    //given
    const userId = randomUUID();
    const workoutId = randomUUID();
    const existingWorkout: Workout = {
      id: workoutId,
      userId,
      startTime: new Date(),
      endTime: null,
      exercises: [],
    };
    repository.get.mockResolvedValue(existingWorkout);
    //when & then
    await expect(workoutService.removeExercise(userId, workoutId, 0)).rejects.toThrow('Exercise not found in workout');
    expect(repository.get).toHaveBeenCalledWith(workoutId, userId);
    expect(repository.save).not.toHaveBeenCalled();
  });
  test('should add set for exercise in workout', async () => {
    //given
    const userId = randomUUID();
    const workoutId = randomUUID();

    const existingWorkout: Workout = {
      id: workoutId,
      userId,
      startTime: new Date(),
      endTime: null,
      exercises: [{ exerciseId: randomUUID(), sets: [], order: 0, isCompleted: false }],
    };
    repository.get.mockResolvedValue(existingWorkout);

    //when
    await workoutService.addSet(userId, workoutId, 0);
    const savedWorkout = repository.save.mock.calls[0][0];

    //then
    expect(repository.get).toHaveBeenCalledWith(workoutId, userId);
    expect(repository.save).toHaveBeenCalled();
    expect(savedWorkout.exercises[0].sets).toHaveLength(1);
  });
  test('should throw error when addding set to non-existing exercise from workout', async () => {
    //given
    const userId = randomUUID();
    const workoutId = randomUUID();
    const existingWorkout: Workout = {
      id: workoutId,
      userId,
      startTime: new Date(),
      endTime: null,
      exercises: [],
    };
    repository.get.mockResolvedValue(existingWorkout);
    //when & then
    await expect(workoutService.addSet(userId, workoutId, 0)).rejects.toThrow('Exercise not found in workout');
    expect(repository.get).toHaveBeenCalledWith(workoutId, userId);
    expect(repository.save).not.toHaveBeenCalled();
  });
  test('should throw error when adding set to exercise in non-existing workout', async () => {
    //given
    const userId = randomUUID();
    const workoutId = randomUUID();

    repository.get.mockResolvedValue(null);

    //when & then
    await expect(workoutService.addSet(userId, workoutId, 0)).rejects.toThrow('Workout not found');
    expect(repository.get).toHaveBeenCalledWith(workoutId, userId);
    expect(repository.save).not.toHaveBeenCalled();
  });
  test('should remove set from exercise in workout', async () => {
    //given
    const userId = randomUUID();
    const workoutId = randomUUID();

    const existingWorkout: Workout = {
      id: workoutId,
      userId,
      startTime: new Date(),
      endTime: null,
      exercises: [
        {
          exerciseId: randomUUID(),
          sets: [
            { weight: 70, order: 0, reps: 10, isCompleted: false },
            { weight: 50, order: 1, reps: 12, isCompleted: false },
          ],
          order: 0,
          isCompleted: false,
        },
      ],
    };
    repository.get.mockResolvedValue(existingWorkout);
    //when
    await workoutService.removeSet(userId, workoutId, 0, 0);
    const savedWorkout = repository.save.mock.calls[0][0];

    //then
    expect(repository.get).toHaveBeenCalledWith(workoutId, userId);
    expect(repository.save).toHaveBeenCalled();
    expect(savedWorkout.exercises[0].sets).toHaveLength(1);
    expect(savedWorkout.exercises[0].sets[0].order).toBe(0);
  });
  test('should throw error when removing set from non-existing exercise in workout', async () => {
    //given
    const userId = randomUUID();
    const workoutId = randomUUID();

    const existingWorkout: Workout = {
      id: workoutId,
      userId,
      startTime: new Date(),
      endTime: null,
      exercises: [],
    };
    repository.get.mockResolvedValue(existingWorkout);
    //when & then
    await expect(workoutService.removeSet(userId, workoutId, 0, 0)).rejects.toThrow('Exercise not found in workout');
    expect(repository.get).toHaveBeenCalledWith(workoutId, userId);
    expect(repository.save).not.toHaveBeenCalled();
  });
  test('should throw error when removing set from exercise in non-existing workout', async () => {
    //given
    const userId = randomUUID();
    const workoutId = randomUUID();

    repository.get.mockResolvedValue(null);

    //when & then
    await expect(workoutService.removeSet(userId, workoutId, 0, 0)).rejects.toThrow('Workout not found');
    expect(repository.get).toHaveBeenCalledWith(workoutId, userId);
    expect(repository.save).not.toHaveBeenCalled();
  });
  test('should add weight and reps to set in exercise in workour', async () => {
    //given
    const userId = randomUUID();
    const workoutId = randomUUID();

    const existingWorkout: Workout = {
      id: workoutId,
      userId,
      startTime: new Date(),
      endTime: null,
      exercises: [
        {
          exerciseId: randomUUID(),
          sets: [{ weight: null, reps: null, order: 0, isCompleted: false }],
          order: 0,
          isCompleted: false,
        },
      ],
    };
    repository.get.mockResolvedValue(existingWorkout);
    //when
    await workoutService.addWeightAndReps(userId, workoutId, 0, 0, 80, 10);
    const savedWorkout = repository.save.mock.calls[0][0];
    //then
    expect(repository.get).toHaveBeenCalledWith(workoutId, userId);
    expect(repository.save).toHaveBeenCalled();
    expect(savedWorkout.exercises[0].sets[0].weight).toBe(80);
    expect(savedWorkout.exercises[0].sets[0].reps).toBe(10);
  });
  test('should throw error when adding weight and reps to set in non-existing exercise in workout', async () => {
    //given
    const userId = randomUUID();
    const workoutId = randomUUID();

    const existingWorkout: Workout = {
      id: workoutId,
      userId,
      startTime: new Date(),
      endTime: null,
      exercises: [],
    };
    repository.get.mockResolvedValue(existingWorkout);
    //when & then
    await expect(workoutService.addWeightAndReps(userId, workoutId, 0, 0, 80, 10)).rejects.toThrow(
      'Exercise not found in workout',
    );
    expect(repository.get).toHaveBeenCalledWith(workoutId, userId);
    expect(repository.save).not.toHaveBeenCalled();
  });
  test('should throw error when adding weight and reps to set in exercise in non-existing workout', async () => {
    //given
    const userId = randomUUID();
    const workoutId = randomUUID();

    repository.get.mockResolvedValue(null);

    //when & then
    await expect(workoutService.addWeightAndReps(userId, workoutId, 0, 0, 80, 10)).rejects.toThrow('Workout not found');
    expect(repository.get).toHaveBeenCalledWith(workoutId, userId);
    expect(repository.save).not.toHaveBeenCalled();
  });
  test('should mark set as completed in exercise in workout', async () => {
    //given
    const userId = randomUUID();
    const workoutId = randomUUID();

    const existingWorkout: Workout = {
      id: workoutId,
      userId,
      startTime: new Date(),
      endTime: null,
      exercises: [
        {
          exerciseId: randomUUID(),
          sets: [{ weight: null, reps: null, order: 0, isCompleted: false }],
          order: 0,
          isCompleted: false,
        },
      ],
    };
    repository.get.mockResolvedValue(existingWorkout);
    //when
    await workoutService.markSetAsCompleted(userId, workoutId, 0, 0);
    const savedWorkout = repository.save.mock.calls[0][0];
    //then
    expect(repository.get).toHaveBeenCalledWith(workoutId, userId);
    expect(repository.save).toHaveBeenCalled();
    expect(savedWorkout.exercises[0].sets[0].isCompleted).toBe(true);
  });
  test('should mark set as uncompleted in exercise in workout', async () => {
    //given
    const userId = randomUUID();
    const workoutId = randomUUID();

    const existingWorkout: Workout = {
      id: workoutId,
      userId,
      startTime: new Date(),
      endTime: null,
      exercises: [
        {
          exerciseId: randomUUID(),
          sets: [{ weight: null, reps: null, order: 0, isCompleted: true }],
          order: 0,
          isCompleted: false,
        },
      ],
    };
    repository.get.mockResolvedValue(existingWorkout);
    //when
    await workoutService.markSetAsUnCompleted(userId, workoutId, 0, 0);
    const savedWorkout = repository.save.mock.calls[0][0];
    //then
    expect(repository.get).toHaveBeenCalledWith(workoutId, userId);
    expect(repository.save).toHaveBeenCalled();
    expect(savedWorkout.exercises[0].sets[0].isCompleted).toBe(false);
  });
  test('should finish workout', async () => {
    //given
    const userId = randomUUID();
    const workoutId = randomUUID();
    const endTime = new Date();

    const existingWorkout: Workout = {
      id: workoutId,
      userId,
      startTime: new Date(),
      endTime: null,
      exercises: [],
    };
    repository.get.mockResolvedValue(existingWorkout);
    //when
    await workoutService.finishWorkout(userId, workoutId, endTime);
    const savedWorkout = repository.save.mock.calls[0][0];
    //then
    expect(repository.get).toHaveBeenCalledWith(workoutId, userId);
    expect(repository.save).toHaveBeenCalled();
    expect(savedWorkout.endTime).toBe(endTime);
  });
});
