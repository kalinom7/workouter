import { type UUID } from 'node:crypto';
import { type WorkoutExercise } from './WorkoutExercise.js';

export type Workout = {
  id: UUID;
  userId: UUID;
  startTime: Date;
  usedWorkoutTemplate: UUID | null;
  endTime: Date | null;
  exercises: WorkoutExercise[];
};
