import { createMock, type DeepMocked } from '@golevelup/ts-jest';
import { randomUUID } from 'node:crypto';
import { type ExerciseRepository } from '../../../src/domain/exercise/ExerciseRepository.js';
import { ExerciseService } from '../../../src/domain/exercise/ExerciseService.js';
import { type Exercise } from '../../../src/domain/exercise/model/Exercise.js';

describe('ExerciseService', () => {
  let exerciseService: ExerciseService;
  let repository: DeepMocked<ExerciseRepository>;

  beforeEach(() => {
    repository = createMock<ExerciseRepository>();
    exerciseService = new ExerciseService(repository);
  });

  test('should create exercise', async () => {
    //given
    const userId = randomUUID();
    const exercise: Exercise = {
      id: expect.any(String),
      name: 'Test exercise',
      description: 'test description',
      userId,
    };

    //when
    const createdExercise = await exerciseService.create('Test exercise', userId, 'test description');

    //then
    expect(createdExercise).not.toBeNull();
    expect(createdExercise).toEqual(exercise);
    expect(repository.save).toHaveBeenCalledWith(exercise);
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(createdExercise.description).toBe('test description');
  });
  test('should create exercise without description', async () => {
    //given
    const userId = randomUUID();
    const exercise: Exercise = {
      id: expect.any(String),
      name: 'Test exercise',
      userId,
    };

    //when
    const createdExercise = await exerciseService.create('Test exercise', userId);

    //then
    expect(createdExercise).not.toBeNull();
    expect(createdExercise).toEqual(exercise);
    expect(repository.save).toHaveBeenCalledWith(exercise);
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(createdExercise.description).toBeUndefined();
  });
  test('should get exercise', async () => {
    //given
    const userId = randomUUID();
    const exerciseId = randomUUID();
    const mockExercise: Exercise = { id: exerciseId, name: 'Test exercise', description: 'test description', userId };
    repository.get.mockResolvedValue(mockExercise);

    //when
    const fetchedExercise = await exerciseService.get(exerciseId, userId);

    //then
    expect(fetchedExercise).not.toBeNull();
    expect(fetchedExercise).toBe(mockExercise);
    expect(repository.get).toHaveBeenCalledWith(exerciseId, userId);
    expect(mockExercise).toEqual(fetchedExercise);
  });

  test('should update exercise', async () => {
    //given
    const userId = randomUUID();
    const exerciseId = randomUUID();
    const exercise: Exercise = {
      id: exerciseId,
      name: 'Test exercise',
      description: 'test description',
      userId: userId,
    };
    repository.get.mockResolvedValue(exercise);
    //when
    const updatedExercise: Exercise = await exerciseService.update(
      exercise.id,
      'Updated exercise',
      exercise.userId,
      'updated description',
    );
    //then
    expect(repository.save).toHaveBeenCalledWith({
      id: exercise.id,
      name: 'Updated exercise',
      userId: exercise.userId,
      description: 'updated description',
    });
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(exercise.id).toEqual(updatedExercise.id);
    expect(exercise.userId).toEqual(updatedExercise.userId);
  });
  test('should delete exercise', async () => {
    //given
    const exercise: Exercise = {
      id: randomUUID(),
      name: 'Test exercise',
      description: 'test description',
      userId: randomUUID(),
    };
    //when
    await exerciseService.delete(exercise.id, exercise.userId);
    //then
    expect(repository.delete).toHaveBeenCalledWith(exercise.id, exercise.userId);
    expect(repository.delete).toHaveBeenCalledTimes(1);
  });
  test('should throw error when trying to get non existing exercise', async () => {
    //given
    //when
    repository.get.mockResolvedValue(null);
    await expect(exerciseService.get(randomUUID(), randomUUID())).rejects.toThrow();

    //then
    expect(repository.get).toHaveBeenCalledTimes(1);
  });
});
