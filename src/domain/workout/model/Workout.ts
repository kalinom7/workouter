import { type UUID } from 'node:crypto';
import { type WorkoutExercise } from './WorkoutExercise.js';

export type Workout = {
  id: UUID;
  userId: UUID;
  startTime: Date;
  endTime: Date | null;
  exercises: WorkoutExercise[];
};
