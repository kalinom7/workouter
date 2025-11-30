import { z } from 'zod';
import { type UUID } from 'node:crypto';

export const createExerciseBodyDto = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});
export type CreateExerciseBodyDto = z.infer<typeof createExerciseBodyDto>;

export const getExerciseParamsDto = z.object({
  exerciseId: z.uuid().transform((str) => str as UUID),
});
export type GetExerciseParamsDto = z.infer<typeof getExerciseParamsDto>;

export const updateExerciseBodyDto = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});
export type UpdateExerciseBodyDto = z.infer<typeof updateExerciseBodyDto>;

export const updateExerciseParamsDto = z.object({
  exerciseId: z.uuid().transform((str) => str as UUID),
});
export type UpdateExerciseParamsDto = z.infer<typeof updateExerciseParamsDto>;

export const deleteExerciseParamsDto = z.object({
  exerciseId: z.uuid().transform((str) => str as UUID),
});
export type DeleteExerciseParamsDto = z.infer<typeof deleteExerciseParamsDto>;
