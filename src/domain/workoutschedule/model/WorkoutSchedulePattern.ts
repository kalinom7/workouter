import { type UUID } from 'node:crypto';
export type WorkoutPatternItem =
  | { patternItemId: UUID; order: number; useOrder: number; type: 'workout'; workoutTemplateId: UUID }
  | { patternItemId: UUID; order: number; useOrder: number; type: 'rest'; workoutTemplateId: null };
