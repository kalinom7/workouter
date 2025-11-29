import { Container } from 'inversify';
import { Validator } from './application/validation/Validator.js';
import { ExerciseRepository, InMemoExerciseRepository } from './domain/exercise/ExerciseRepository.js';
import { InMemoWorkoutRepository, WorkoutRepository } from './domain/workout/WorkoutRepository.js';
import {
  InMemoWorkoutTemplateRepository,
  WorkoutTemplateRepository,
} from './domain/workouttemplate/WorkoutTemplateRepository.js';

const container = new Container({
  autobind: true,
});

container.bind(WorkoutRepository).to(InMemoWorkoutRepository).inSingletonScope();
container.bind(WorkoutTemplateRepository).to(InMemoWorkoutTemplateRepository).inSingletonScope();
container.bind(ExerciseRepository).to(InMemoExerciseRepository).inSingletonScope();
container.bind(Validator).to(Validator);
export { container };
