import { type UUID } from 'node:crypto';
export type WorkoutPatternItem =
  | { patternItemId: UUID; order: number; useOrder: number; type: 'workout'; WorkoutTemplateId: UUID }
  | { patternItemId: UUID; order: number; useOrder: number; type: 'rest' };
