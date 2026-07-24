import { type UUID } from 'node:crypto';
import { type WorkoutExerciseSet } from './WorkoutExerciseSet.js';

export type WorkoutExercise = {
  exercise: {
    id: UUID;
    name: string;
  };
  sets: WorkoutExerciseSet[];
  restPeriod?: number; //seconds
  order: number;
  isCompleted: boolean;
};
