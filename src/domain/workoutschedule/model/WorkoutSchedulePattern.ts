import { type UUID } from 'node:crypto';
import { type WorkoutTemplate } from '../../workouttemplate/model/WorkoutTemplate.js';
export type WorkoutPatternItem = {
  id: UUID;
  order: number;
  useOrder: number;
  workoutTemplate: WorkoutTemplate;
  restDays: number;
};
