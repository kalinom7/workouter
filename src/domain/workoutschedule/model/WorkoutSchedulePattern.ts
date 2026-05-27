import { type UUID } from 'node:crypto';
export type WorkoutPatternItem = {
  patternItemId: UUID;
  order: number;
  useOrder: number;
  workoutTemplateId: UUID;
  restDays: number;
};
