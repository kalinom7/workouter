import { type UUID } from 'node:crypto';
export type WorkoutScheduleBlock =
  | { blockItemId: UUID; type: 'workouttemplate'; WorkoutTemplateId: UUID }
  | { blockItemId: UUID; type: 'rest'; period: number };
