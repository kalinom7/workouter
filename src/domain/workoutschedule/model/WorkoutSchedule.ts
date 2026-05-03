import { type UUID } from 'node:crypto';
import { type WorkoutPatternItem } from './WorkoutScheduleBlock.js';
export type WorkoutSchedule = {
  isActive: boolean;
  id: UUID;
  name: string;
  userId: UUID;
  pattern: WorkoutPatternItem[];
};
