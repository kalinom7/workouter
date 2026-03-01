import { z } from 'zod';
import { type UUID } from 'node:crypto';

export const createWorkoutTemplateBodyDto = z.object({
  name: z.string().min(1),
});
export type CreateWorkoutTemplateBodyDto = z.infer<typeof createWorkoutTemplateBodyDto>;

export const addWorkoutTemplateExerciseBodyDto = z.object({
  exerciseId: z.uuid().transform((str) => str as UUID),
  sets: z.number().min(0),
  restPeriod: z.number().min(0),
});
export type AddWorkoutTemplateExerciseBodyDto = z.infer<typeof addWorkoutTemplateExerciseBodyDto>;

export const addWorkoutTemplateExerciseParamsDto = z.object({
  workoutTemplateId: z.uuid().transform((str) => str as UUID),
});
export type AddWorkoutTemplateExerciseParamsDto = z.infer<typeof addWorkoutTemplateExerciseParamsDto>;

export const removeWorkoutTemplateExerciseParamsDto = z.object({
  workoutTemplateId: z.uuid().transform((str) => str as UUID),
  order: z.coerce.number().min(0),
});
export type RemoveWorkoutTemplateExerciseParamsDto = z.infer<typeof removeWorkoutTemplateExerciseParamsDto>;

export const getWorkoutTemplateParamsDto = z.object({
  workoutTemplateId: z.uuid().transform((str) => str as UUID),
});
export type GetWorkoutTemplateParamsDto = z.infer<typeof getWorkoutTemplateParamsDto>;

export const deleteWorkoutTemplateParamsDto = z.object({
  workoutTemplateId: z.uuid().transform((str) => str as UUID),
});

export type DeleteWorkoutTemplateParamsDto = z.infer<typeof deleteWorkoutTemplateParamsDto>;

export const editWorkoutTemplateExerciseParamsDto = z.object({
  workoutTemplateId: z.uuid().transform((str) => str as UUID),
  order: z.coerce.number().min(0),
});
export type EditWorkoutTemplateExerciseParamsDto = z.infer<typeof editWorkoutTemplateExerciseParamsDto>;

export const editWorkoutTemplateExerciseBodyDto = z.object({
  sets: z.number().min(0),
  restPeriod: z.number().min(0),
});
export type EditWorkoutTemplateExerciseBodyDto = z.infer<typeof editWorkoutTemplateExerciseBodyDto>;
