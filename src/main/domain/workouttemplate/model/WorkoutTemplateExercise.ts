import { type Exercise } from './Exercise.js';

export type WorkoutTemplateExercise = {
  exercise: Exercise;
  sets: number;
  restPeriod: number; //seconds
  order: number;
};
