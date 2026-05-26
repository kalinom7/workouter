import { type UUID } from 'node:crypto';
import { type WorkoutPatternItem } from './WorkoutSchedulePattern.js';
export type WorkoutSchedule = {
  isActive: boolean;
  setActiveDate: Date | null;
  id: UUID;
  name: string;
  userId: UUID;
  pattern: WorkoutPatternItem[];
  lastOrder: number | null;
  lastFinishedWorkoutDate: Date | null;
};
