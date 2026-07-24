import { type Exercise } from '../../exercise/model/Exercise.js';

export type WorkoutTemplateExercise = {
  exercise: Exercise;
  sets: number;
  restPeriod: number; //seconds
  order: number;
};
