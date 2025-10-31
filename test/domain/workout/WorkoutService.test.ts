import { randomUUID } from 'node:crypto';
import { type Workout } from '../../../src/domain/workout/model/Workout.js';
import { type WorkoutRepository } from '../../../src/domain/workout/WorkoutRepository.js';
import { type WorkoutTemplateService } from '../../../src/domain/workouttemplate/WorkoutTemplateService.js';
import { type ExerciseService } from '../../../src/domain/exercise/ExerciseService.js';
import { type WorkoutExercise } from '../../../src/domain/workout/model/WorkoutExercise.js';
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
});
