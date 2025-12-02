import { z } from 'zod';
import { type UUID } from 'node:crypto';

export const startWorkoutFromTemplateBodyDto = z.object({
  workoutTemplateId: z.uuid().transform((str) => str as UUID),
});
export type StartWorkoutFromTemplateBodyDto = z.infer<typeof startWorkoutFromTemplateBodyDto>;

export const finishWorkoutParamsDto = z.object({
  workoutId: z.uuid().transform((str) => str as UUID),
});
export type FinishWorkoutParamsDto = z.infer<typeof finishWorkoutParamsDto>;

export const addExerciseBodyDto = z.object({
  exerciseId: z.uuid().transform((str) => str as UUID),
});
export type AddExerciseBodyDto = z.infer<typeof addExerciseBodyDto>;

export const addExerciseParamsDto = z.object({
  workoutId: z.uuid().transform((str) => str as UUID),
});
export type AddExerciseParamsDto = z.infer<typeof addExerciseParamsDto>;

export const removeExerciseParamsDto = z.object({
  workoutId: z.uuid().transform((str) => str as UUID),
  exerciseOrder: z.number().int().min(0),
});
export type RemoveExerciseParamsDto = z.infer<typeof removeExerciseParamsDto>;

export const addSetParamsDto = z.object({
  workoutId: z.uuid().transform((str) => str as UUID),
  exerciseOrder: z.number().int().min(0),
});
export type AddSetParamsDto = z.infer<typeof addSetParamsDto>;

export const removeSetParamsDto = z.object({
  workoutId: z.uuid().transform((str) => str as UUID),
  exerciseOrder: z.number().int().min(0),
  setOrder: z.number().int().min(0),
});
export type RemoveSetParamsDto = z.infer<typeof removeSetParamsDto>;

export const addWeightAndRepsBodyDto = z.object({
  weight: z.number().nonnegative(),
  reps: z.number().int().nonnegative(),
});
export type AddWeightAndRepsBodyDto = z.infer<typeof addWeightAndRepsBodyDto>;

export const addWeightAndRepsParamsDto = z.object({
  workoutId: z.uuid().transform((str) => str as UUID),
  exerciseOrder: z.number().int().min(0),
  setOrder: z.number().int().min(0),
});
export type AddWeightAndRepsParamsDto = z.infer<typeof addWeightAndRepsParamsDto>;

export const markSetAsCompletedParamsDto = z.object({
  workoutId: z.uuid().transform((str) => str as UUID),
  exerciseOrder: z.number().int().min(0),
  setOrder: z.number().int().min(0),
});
export type MarkSetAsCompletedParamsDto = z.infer<typeof markSetAsCompletedParamsDto>;

export const markSetAsUnCompletedParamsDto = z.object({
  workoutId: z.uuid().transform((str) => str as UUID),
  exerciseOrder: z.number().int().min(0),
  setOrder: z.number().int().min(0),
});
export type MarkSetAsUnCompletedParamsDto = z.infer<typeof markSetAsUnCompletedParamsDto>;

export const MarkExerciseAsCompletedParamsDto = z.object({
  workoutId: z.uuid().transform((str) => str as UUID),
  exerciseOrder: z.number().int().min(0),
});
export type MarkExerciseAsCompletedParamsDto = z.infer<typeof MarkExerciseAsCompletedParamsDto>;

export const MarkExerciseAsUnCompletedParamsDto = z.object({
  workoutId: z.uuid().transform((str) => str as UUID),
  exerciseOrder: z.number().int().min(0),
});
export type MarkExerciseAsUnCompletedParamsDto = z.infer<typeof MarkExerciseAsUnCompletedParamsDto>;
