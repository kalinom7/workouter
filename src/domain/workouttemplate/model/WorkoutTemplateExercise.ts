import { type UUID } from 'node:crypto';

export type WorkoutTemplateExercise = {
  exercise: UUID;
  sets: number;
  restPeriod: number; //seconds
  order: number;
};
