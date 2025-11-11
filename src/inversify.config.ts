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
import { WorkoutTemplateController } from './application/WorkoutTemplateController.js';

const container = new Container();

container.bind(TYPES.WorkoutController).to(WorkoutController);
container.bind(TYPES.WorkoutService).to(WorkoutService);
container.bind(TYPES.WorkoutTemplateService).to(WorkoutTemplateService);
container.bind(TYPES.ExerciseService).to(ExerciseService);
container.bind(TYPES.WorkoutTemplateController).to(WorkoutTemplateController);

container.bind(TYPES.WorkoutRepository).to(InMemoWorkoutRepository).inSingletonScope();
container.bind(TYPES.WorkoutTemplateRepository).to(InMemoWorkoutTemplateRepository).inSingletonScope();
container.bind(TYPES.ExerciseRepository).to(InMemoExerciseRepository).inSingletonScope();
container.bind(TYPES.Validator).to(Validator);
export { container };
