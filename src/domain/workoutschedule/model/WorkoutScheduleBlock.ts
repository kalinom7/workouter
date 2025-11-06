import { type UUID } from 'node:crypto';
export type WorkoutScheduleBlock =
  | { blockItemId: UUID; order: number; type: 'workouttemplate'; WorkoutTemplateId: UUID }
  | { blockItemId: UUID; order: number; type: 'rest'; period: number };
