import { type UUID } from 'node:crypto';
import { type WorkoutExerciseSet } from './WorkoutExerciseSet.js';

export type WorkoutExercise = {
  exerciseId: UUID;
  sets: WorkoutExerciseSet[];
  restPeriod?: number; //seconds
  order: number;
  isCompleted: boolean;
};
