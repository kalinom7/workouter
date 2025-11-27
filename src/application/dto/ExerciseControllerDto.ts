import { z } from 'zod';
import { type UUID } from 'node:crypto';

export const createExerciseDto = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  userId: z.uuid().transform((str) => str as UUID),
});
export type CreateExerciseDto = z.infer<typeof createExerciseDto>;

export const getExerciseOrDeleteDto = z.object({
  exerciseId: z.uuid().transform((str) => str as UUID),
  userId: z.uuid().transform((str) => str as UUID),
});
export type GetExerciseDto = z.infer<typeof getExerciseOrDeleteDto>;

export const updateExerciseDto = z.object({
  exerciseId: z.uuid().transform((str) => str as UUID),
  name: z.string().min(1),
  description: z.string().optional(),
  userId: z.uuid().transform((str) => str as UUID),
});
export type UpdateExerciseDto = z.infer<typeof updateExerciseDto>;
