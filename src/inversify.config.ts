import { Container } from 'inversify';
import { Validator } from './application/validation/Validator.js';
import { ExerciseRepository, InMemoExerciseRepository } from './domain/exercise/ExerciseRepository.js';
import { InMemoWorkoutRepository, WorkoutRepository } from './domain/workout/WorkoutRepository.js';
import {
  InMemoWorkoutTemplateRepository,
  WorkoutTemplateRepository,
} from './domain/workouttemplate/WorkoutTemplateRepository.js';
import {
  WorkoutScheduleRepository,
  InMemoWorkoutScheduleRepository,
} from './domain/workoutschedule/WorkoutScheduleRepository.js';
import { WorkoutController } from './application/controller/WorkoutController.js';
import { Controller } from './application/controller/Controller.js';

const container = new Container({
  autobind: true,
});

container.bind(Controller).to(WorkoutController);
container.bind(WorkoutRepository).to(InMemoWorkoutRepository).inSingletonScope();
container.bind(WorkoutTemplateRepository).to(InMemoWorkoutTemplateRepository).inSingletonScope();
container.bind(ExerciseRepository).to(InMemoExerciseRepository).inSingletonScope();
container.bind(WorkoutScheduleRepository).to(InMemoWorkoutScheduleRepository).inSingletonScope();
container.bind(Validator).to(Validator);
export { container };
