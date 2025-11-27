import { z } from 'zod';
import { type UUID } from 'node:crypto';

export const createWorkoutScheduleDto = z.object({
  name: z.string().min(1),
  userId: z.uuid().transform((str) => str as UUID),
});
export type CreateWorkoutScheduleDto = z.infer<typeof createWorkoutScheduleDto>;

export const getOrDeleteWorkoutScheduleDto = z.object({
  workoutScheduleId: z.uuid().transform((str) => str as UUID),
  userId: z.uuid().transform((str) => str as UUID),
});
export type GetOrDeleteWorkoutScheduleDto = z.infer<typeof getOrDeleteWorkoutScheduleDto>;

export const addWorkoutToBlockDto = z.object({
  workoutScheduleId: z.uuid().transform((str) => str as UUID),
  userId: z.uuid().transform((str) => str as UUID),
  workoutTemplateId: z.uuid().transform((str) => str as UUID),
});
export type AddWorkoutToBlockDto = z.infer<typeof addWorkoutToBlockDto>;

export const addRestToBlockDto = z.object({
  workoutScheduleId: z.uuid().transform((str) => str as UUID),
  userId: z.uuid().transform((str) => str as UUID),
  restPeriod: z.number().min(1),
});
export type AddRestToBlockDto = z.infer<typeof addRestToBlockDto>;

export const removeBlockItemDto = z.object({
  userId: z.uuid().transform((str) => str as UUID),
  workoutScheduleId: z.uuid().transform((str) => str as UUID),
  blockItemId: z.uuid().transform((str) => str as UUID),
});
export type RemoveBlockItemDto = z.infer<typeof removeBlockItemDto>;

export type SetActiveInactiveDto = z.infer<typeof getOrDeleteWorkoutScheduleDto>;
