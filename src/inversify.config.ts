import { Container } from 'inversify';
import { TYPES } from './types.js';
import { WorkoutController } from './application/WorkoutController.js';
import { WorkoutService } from './domain/workout/WorkoutService.js';
import { WorkoutTemplateService } from './domain/workouttemplate/WorkoutTemplateService.js';
import { ExerciseService } from './domain/exercise/ExerciseService.js';
import { InMemoWorkoutRepository } from './domain/workout/WorkoutRepository.js';
import { InMemoWorkoutTemplateRepository } from './domain/workouttemplate/WorkoutTemplateRepository.js';
import { InMemoExerciseRepository } from './domain/exercise/ExerciseRepository.js';
import { Validator } from './application/validation/Validator.js';

const container = new Container();
container.bind(TYPES.WorkoutController).to(WorkoutController);
container.bind(TYPES.WorkoutService).to(WorkoutService);
container.bind(TYPES.WorkoutTemplateService).to(WorkoutTemplateService);
container.bind(TYPES.ExerciseService).to(ExerciseService);

container.bind(TYPES.WorkoutRepository).to(InMemoWorkoutRepository);
container.bind(TYPES.WorkoutTemplateRepository).to(InMemoWorkoutTemplateRepository);
container.bind(TYPES.ExerciseRepository).to(InMemoExerciseRepository);
container.bind(TYPES.Validator).to(Validator);
export { container };
