import { z } from 'zod';
import { type UUID } from 'node:crypto';

export const createWorkoutScheduleBodyDto = z.object({
  name: z.string().min(1),
});
export type CreateWorkoutScheduleBodyDto = z.infer<typeof createWorkoutScheduleBodyDto>;

export const getWorkoutScheduleParamsDto = z.object({
  workoutScheduleId: z.uuid().transform((str) => str as UUID),
});
export type GetWorkoutScheduleParamsDto = z.infer<typeof getWorkoutScheduleParamsDto>;

export const deleteWorkoutScheduleParamsDto = z.object({
  workoutScheduleId: z.uuid().transform((str) => str as UUID),
});
export type DeleteWorkoutScheduleParamsDto = z.infer<typeof deleteWorkoutScheduleParamsDto>;

export const addWorkoutToBlockBodyDto = z.object({
  workoutTemplateId: z.uuid().transform((str) => str as UUID),
});
export type AddWorkoutToBlockBodyDto = z.infer<typeof addWorkoutToBlockBodyDto>;

export const addWorkoutToBlockParamsDto = z.object({
  workoutScheduleId: z.uuid().transform((str) => str as UUID),
});
export type AddWorkoutToBlockParamsDto = z.infer<typeof addWorkoutToBlockParamsDto>;

export const addRestToBlockBodyDto = z.object({
  restPeriod: z.number().min(1),
});
export type AddRestToBlockBodyDto = z.infer<typeof addRestToBlockBodyDto>;

export const addRestToBlockParamsDto = z.object({
  workoutScheduleId: z.uuid().transform((str) => str as UUID),
});
export type AddRestToBlockParamsDto = z.infer<typeof addRestToBlockParamsDto>;

export const removeBlockItemBodyDto = z.object({
  blockItemId: z.uuid().transform((str) => str as UUID),
});
export type RemoveBlockItemBodyDto = z.infer<typeof removeBlockItemBodyDto>;

export const removeBlockItemParamsDto = z.object({
  workoutScheduleId: z.uuid().transform((str) => str as UUID),
});
export type RemoveBlockItemParamsDto = z.infer<typeof removeBlockItemParamsDto>;

export const setWorkoutScheduleActiveParamsDto = z.object({
  workoutScheduleId: z.uuid().transform((str) => str as UUID),
});
export type SetWorkoutScheduleActiveParamsDto = z.infer<typeof setWorkoutScheduleActiveParamsDto>;

export const SetWorkoutScheduleInActiveParamsDto = z.object({
  workoutScheduleId: z.uuid().transform((str) => str as UUID),
});
export type SetWorkoutScheduleInActiveParamsDto = z.infer<typeof SetWorkoutScheduleInActiveParamsDto>;
