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
import { ExerciseController } from './application/controller/ExerciseController.js';
import { WorkoutTemplateController } from './application/controller/WorkoutTemplateController.js';
import { WorkoutScheduleController } from './application/controller/WorkoutScheduleController.js';

const container = new Container({
  autobind: true,
});

container.bind(Controller).to(WorkoutController);
container.bind(Controller).to(ExerciseController);
container.bind(Controller).to(WorkoutTemplateController);
container.bind(Controller).to(WorkoutScheduleController);
container.bind(WorkoutRepository).to(InMemoWorkoutRepository).inSingletonScope();
container.bind(WorkoutTemplateRepository).to(InMemoWorkoutTemplateRepository).inSingletonScope();
container.bind(ExerciseRepository).to(InMemoExerciseRepository).inSingletonScope();
container.bind(WorkoutScheduleRepository).to(InMemoWorkoutScheduleRepository).inSingletonScope();
container.bind(Validator).to(Validator);
export { container };
