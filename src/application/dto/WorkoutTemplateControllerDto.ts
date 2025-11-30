import { z } from 'zod';
import { type UUID } from 'node:crypto';

export const createWorkoutTemplateDto = z.object({
  name: z.string().min(1),
});
export type CreateWorkoutTemplateDto = z.infer<typeof createWorkoutTemplateDto>;

export const addWorkoutTemplateExerciseBodyDto = z.object({
  exerciseId: z.uuid().transform((str) => str as UUID),
});
export type AddWorkoutTemplateExerciseBodyDto = z.infer<typeof addWorkoutTemplateExerciseBodyDto>;

export const addWorkoutTemplateExerciseParamsDto = z.object({
  workoutTemplateId: z.uuid().transform((str) => str as UUID),
});
export type AddWorkoutTemplateExerciseParamsDto = z.infer<typeof addWorkoutTemplateExerciseParamsDto>;

export const removeWorkoutTemplateExerciseBodyDto = z.object({
  order: z.number().min(0),
});
export type RemoveWorkoutTemplateExerciseBodyDto = z.infer<typeof removeWorkoutTemplateExerciseBodyDto>;

export const removeWorkoutTemplateExerciseParamsDto = z.object({
  workoutTemplateId: z.uuid().transform((str) => str as UUID),
});
export type RemoveWorkoutTemplateExerciseParamsDto = z.infer<typeof removeWorkoutTemplateExerciseParamsDto>;

export const setNumberOfSetsDto = z.object({
  sets: z.number().min(1),
});
export type SetNumberOfSetsBodyDto = z.infer<typeof setNumberOfSetsDto>;

export const setNumberOfSetsParamsDto = z.object({
  workoutTemplateId: z.uuid().transform((str) => str as UUID),
  order: z.number().min(0),
});
export type SetNumberOfSetsParamsDto = z.infer<typeof setNumberOfSetsParamsDto>;

export const setRestPeriodBodyDto = z.object({
  restPeriod: z.number().min(0),
});
export type SetRestPeriodBodyDto = z.infer<typeof setRestPeriodBodyDto>;

export const setRestPeriodParamsDto = z.object({
  workoutTemplateId: z.uuid().transform((str) => str as UUID),
  order: z.number().min(0),
});
export type SetRestPeriodParamsDto = z.infer<typeof setRestPeriodParamsDto>;

export const getWorkoutTemplateParamsDto = z.object({
  workoutTemplateId: z.uuid().transform((str) => str as UUID),
});
export type GetWorkoutTemplateParamsDto = z.infer<typeof getWorkoutTemplateParamsDto>;

export const deleteWorkoutTemplateParamsDto = z.object({
  workoutTemplateId: z.uuid().transform((str) => str as UUID),
});

export type DeleteWorkoutTemplateParamsDto = z.infer<typeof deleteWorkoutTemplateParamsDto>;
