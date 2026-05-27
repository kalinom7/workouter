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

export const addWorkoutToPatternBodyDto = z.object({
  workoutTemplateId: z.uuid().transform((str) => str as UUID),
});
export type AddWorkoutToPatternBodyDto = z.infer<typeof addWorkoutToPatternBodyDto>;

export const addWorkoutToPatternParamsDto = z.object({
  workoutScheduleId: z.uuid().transform((str) => str as UUID),
});
export type AddWorkoutToPatternParamsDto = z.infer<typeof addWorkoutToPatternParamsDto>;

export const addRestToPatternWorkoutBodyDto = z.object({
  restDays: z.number().min(1),
});
export type AddRestToPatternWorkoutBodyDto = z.infer<typeof addRestToPatternWorkoutBodyDto>;

export const addRestToPatternWorkoutParamsDto = z.object({
  workoutScheduleId: z.uuid().transform((str) => str as UUID),
  patternItemId: z.uuid().transform((str) => str as UUID),
});
export type AddRestToPatternWorkoutParamsDto = z.infer<typeof addRestToPatternWorkoutParamsDto>;

export const removePatternItemParamsDto = z.object({
  workoutScheduleId: z.uuid().transform((str) => str as UUID),
  patternItemId: z.uuid().transform((str) => str as UUID),
});
export type RemovePatternItemParamsDto = z.infer<typeof removePatternItemParamsDto>;

export const setWorkoutScheduleActiveParamsDto = z.object({
  workoutScheduleId: z.uuid().transform((str) => str as UUID),
});
export type SetWorkoutScheduleActiveParamsDto = z.infer<typeof setWorkoutScheduleActiveParamsDto>;

export const setWorkoutScheduleInactiveParamsDto = z.object({
  workoutScheduleId: z.uuid().transform((str) => str as UUID),
});
export type SetWorkoutScheduleInactiveParamsDto = z.infer<typeof setWorkoutScheduleInactiveParamsDto>;
