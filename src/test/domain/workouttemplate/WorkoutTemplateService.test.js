import { expect, jest, test } from '@jest/globals';
import { randomUUID } from 'crypto';
import { WorkoutTemplate } from '../../../main/domain/workouttemplate/model/WorkoutTemplate.js';
//import { WorkoutTemplateExercise } from "../../main/domain/workouttemplate/model/WorkoutTemplateExercise.js";
import { WorkoutTemplateService } from '../../../main/domain/workouttemplate/WorkoutTemplateService.js';
import { WorkoutTemplateExercise } from '../../../main/domain/workouttemplate/model/WorkoutTemplateExercise.js';
import { Exercise } from '../../../main/domain/workouttemplate/model/Exercise.js';

//mock repository
const mockRepository = {
  save: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
};

describe('WorkoutTemplateService', () => {
  let workoutTemplateService;

  beforeEach(() => {
    jest.clearAllMocks();
    workoutTemplateService = new WorkoutTemplateService(mockRepository);
  });

  test('should create workoutTemplate', () => {
    //given
    const id = randomUUID();
    const userId = randomUUID();
    const workoutTemplate = new WorkoutTemplate(id, 'test workoutTemplate', userId, []);
    mockRepository.save.mockReturnValue(workoutTemplate);

    //when
    const createdWorkoutTemplate = workoutTemplateService.createWorkoutTemplate('test workoutTemplate', userId);

    //then
    expect(createdWorkoutTemplate).toBe(workoutTemplate);
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        name: 'test workoutTemplate',
        userId: userId,
        exercises: [],
      }),
    );
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(createdWorkoutTemplate.id).toBeDefined();
    expect(createdWorkoutTemplate.name).toBe('test workoutTemplate');
    expect(createdWorkoutTemplate).toEqual(workoutTemplate);
  });

  test('should get workoutTemplate', () => {
    //given
    const id = randomUUID();
    const userId = randomUUID();
    const workoutTemplate = new WorkoutTemplate(id, 'test workoutTemplate', userId, []);
    mockRepository.get.mockReturnValue(workoutTemplate);

    //when
    const fetchedWorkoutTemplate = workoutTemplateService.getWorkoutTemplate(id, userId);

    //then
    expect(fetchedWorkoutTemplate).toBe(workoutTemplate);
    expect(mockRepository.get).toHaveBeenCalledWith(id, userId);
    expect(mockRepository.get).toHaveBeenCalledTimes(1);
    expect(fetchedWorkoutTemplate.id).toBe(id);
    expect(fetchedWorkoutTemplate.name).toBe('test workoutTemplate');
    expect(fetchedWorkoutTemplate.exercises).toEqual([]);
  });

  test('should add workoutTemplateExercise to workoutTemplate', () => {
    //given
    let userId = randomUUID();
    let templateId = randomUUID();
    let workoutTemplate = new WorkoutTemplate(templateId, 'tested workoutTemplate', userId, []);
    mockRepository.get.mockReturnValue(workoutTemplate);
    mockRepository.save.mockReturnValue(workoutTemplate);
    let exerciseName = 'test exercise name';

    //when
    workoutTemplate = workoutTemplateService.addWorkoutTemplateExercise(exerciseName, workoutTemplate.id, userId);
    //then

    console.log(workoutTemplate);
    console.log(workoutTemplate.exercises);
    expect(workoutTemplate.exercises.length).toBe(1);
  });

  test('manually added exercise', () => {
    //given
    let userId = randomUUID();
    let templateId = randomUUID();
    const workoutTemplate = new WorkoutTemplate(templateId, 'tested workoutTemplate', userId, []);

    //when
    const order = workoutTemplate.exercises.length;
    const workoutTemplateExercise = new WorkoutTemplateExercise(new Exercise('test exercise'), 0, 0, order);
    const workoutTemplateExercise2 = new WorkoutTemplateExercise(new Exercise('test exercise2'), 0, 0, order);
    workoutTemplate.exercises.push(workoutTemplateExercise);
    workoutTemplate.exercises.push(workoutTemplateExercise2);

    //then
    //console.log(workoutTemplate);
    //console.log(workoutTemplate.exercises);
    expect(workoutTemplate.exercises.length).toBe(2);
  });
});
