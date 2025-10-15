import { createMock, type DeepMocked } from '@golevelup/ts-jest';
import { randomUUID } from 'node:crypto';
import { type ExerciseRepository } from '../../../main/domain/exercise/ExerciseRepository.js';
import { ExerciseService } from '../../../main/domain/exercise/ExerciseService.js';

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
    const exercise = { id: expect.any(String), name: 'Test exercise', description: 'test description', userId };

    //when
    const createdExercise = await exerciseService.create('Test exercise', 'test description', userId);

    //then
    expect(createdExercise).not.toBeNull();
    expect(createdExercise).toEqual(exercise);
    expect(repository.save).toHaveBeenCalledWith(exercise);
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(createdExercise.description).toBe('test description');
  });

  test('should get exercise', async () => {
    //given
    const userId = randomUUID();
    const exerciseId = randomUUID();
    const mockExercise = { id: exerciseId, name: 'Test exercise', description: 'test description', userId };
    repository.get.mockResolvedValue(mockExercise);

    //when
    const fetchedExercise = await exerciseService.get(exerciseId, userId);

    //then
    expect(fetchedExercise).not.toBeNull();
    expect(fetchedExercise).toBe(mockExercise);
    expect(repository.get).toHaveBeenCalledWith(exerciseId, userId);
    expect(mockExercise).toEqual(fetchedExercise);
  });
});
