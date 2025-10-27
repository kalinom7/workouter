import { type UUID } from 'node:crypto';
import { type WorkoutScheduleBlock } from './WorkoutScheduleBlock.js';
export type WorkoutSchedule = {
  isActive: boolean;
  id: UUID;
  name: string;
  userId: UUID;
  block: WorkoutScheduleBlock[];
};
