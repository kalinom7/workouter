import { type UUID } from 'node:crypto';
import { type WorkoutTemplateExercise } from './WorkoutTemplateExercise.js';

export type WorkoutTemplate = {
  id: UUID;
  name: string;
  userId: UUID;
  exercises: WorkoutTemplateExercise[];
};
