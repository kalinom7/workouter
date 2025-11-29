import { z } from 'zod';
import { type UUID } from 'node:crypto';

export const createWorkoutTemplateDto = z.object({
  name: z.string().min(1),
  userId: z.uuid().transform((str) => str as UUID),
});
export type CreateWorkoutTemplateDto = z.infer<typeof createWorkoutTemplateDto>;

export const addWorkoutTemplateExerciseDto = z.object({
  exerciseId: z.uuid().transform((str) => str as UUID),
  workoutTemplateId: z.uuid().transform((str) => str as UUID),
  userId: z.uuid().transform((str) => str as UUID),
});
export type AddWorkoutTemplateExerciseDto = z.infer<typeof addWorkoutTemplateExerciseDto>;

export const removeWorkoutTemplateExerciseDto = z.object({
  workoutTemplateId: z.uuid().transform((str) => str as UUID),
  userId: z.uuid().transform((str) => str as UUID),
  order: z.number().min(0),
});
export type RemoveWorkoutTemplateExerciseDto = z.infer<typeof removeWorkoutTemplateExerciseDto>;

export const setNumberOfSetsDto = z.object({
  sets: z.number().min(1),
  workoutTemplateId: z.uuid().transform((str) => str as UUID),
  userId: z.uuid().transform((str) => str as UUID),
  order: z.number().min(0),
});
export type SetNumberOfSetsDto = z.infer<typeof setNumberOfSetsDto>;

export const setRestPeriodDto = z.object({
  restPeriod: z.number().min(0),
  workoutTemplateId: z.uuid().transform((str) => str as UUID),
  userId: z.uuid().transform((str) => str as UUID),
  order: z.number().min(0),
});
export type SetRestPeriodDto = z.infer<typeof setRestPeriodDto>;

export const getWorkoutTemplateOrDeleteDto = z.object({
  workoutTemplateId: z.uuid().transform((str) => str as UUID),
});
export type GetWorkoutTemplateDto = z.infer<typeof getWorkoutTemplateOrDeleteDto>;
