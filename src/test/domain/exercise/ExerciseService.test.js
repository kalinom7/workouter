import { jest } from '@jest/globals';
import { Exercise } from "../../../main/domain/exercise/model/Exercise.js";
import { ExerciseService } from "../../../main/domain/exercise/ExerciseService.js";
import { randomUUID } from 'crypto';


//mock repository
const mockRepository = {
    save: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
};

describe("ExerciseService", () => {
  let exerciseService;

  beforeEach(() => {
    jest.clearAllMocks(); 
    exerciseService = new ExerciseService(mockRepository);
  });

test("should create exercise", () => {
    //given
    const userId = randomUUID();
    const exerciseId = randomUUID();
    const exercise = new Exercise(exerciseId, "Test exercise", "test description", userId);

    mockRepository.save.mockReturnValue(exercise);

    //when 
    const createdExercise = exerciseService.create("Test exercise", "test description", userId);

    //then 
    expect(createdExercise).not.toBeNull();
    expect(createdExercise).toEqual(exercise);
    expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Exercise));
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(createdExercise.description).toBe("test description");
});

test("shoud get exercise", () => {

    //given 
    const userId = randomUUID();
    const exerciseId = randomUUID();
    const mockExercise = new Exercise(exerciseId, "Test exercise", "test description", userId);
    mockRepository.get.mockReturnValue(mockExercise);

    //when
    const fetchedExercise = exerciseService.get(exerciseId, userId);

    //then  
    expect(fetchedExercise).not.toBeNull();
    expect(fetchedExercise).toBe(mockExercise);
    expect(mockRepository.get).toHaveBeenCalledWith(exerciseId, userId);
    expect(mockExercise).toEqual(fetchedExercise);
    

});

});
