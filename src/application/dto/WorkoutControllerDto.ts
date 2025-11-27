import { z } from 'zod';
import { type UUID } from 'node:crypto';

export const startWorkoutFromTemplateDto = z.object({
  userId: z.uuid().transform((str) => str as UUID),
  workoutTemplateId: z.uuid().transform((str) => str as UUID),
});
export type StartWorkoutFromTemplateDto = z.infer<typeof startWorkoutFromTemplateDto>;

export const finishWorkoutDto = z.object({
  userId: z.uuid().transform((str) => str as UUID),
  workoutId: z.uuid().transform((str) => str as UUID),
});
export type FinishWorkoutDto = z.infer<typeof finishWorkoutDto>;

export const startEmptyWorkoutDto = z.object({
  userId: z.uuid().transform((str) => str as UUID),
});
export type StartEmptyWorkoutDto = z.infer<typeof startEmptyWorkoutDto>;

export const addExerciseDto = z.object({
  userId: z.uuid().transform((str) => str as UUID),
  workoutId: z.uuid().transform((str) => str as UUID),
  exerciseId: z.uuid().transform((str) => str as UUID),
});
export type AddExerciseDto = z.infer<typeof addExerciseDto>;

export const removeExerciseAddSetDto = z.object({
  userId: z.uuid().transform((str) => str as UUID),
  workoutId: z.uuid().transform((str) => str as UUID),
  exerciseOrder: z.number().int().min(0),
});
export type RemoveExerciseAddSetDto = z.infer<typeof removeExerciseAddSetDto>;

export const removeSetDto = z.object({
  userId: z.uuid().transform((str) => str as UUID),
  workoutId: z.uuid().transform((str) => str as UUID),
  exerciseOrder: z.number().int().min(0),
  setOrder: z.number().int().min(0),
});
export type RemoveSetDto = z.infer<typeof removeSetDto>;
export type MarkSet = z.infer<typeof removeSetDto>;

export const addWeightAndRepsDto = z.object({
  userId: z.uuid().transform((str) => str as UUID),
  workoutId: z.uuid().transform((str) => str as UUID),
  exerciseOrder: z.number().int().min(0),
  setOrder: z.number().int().min(0),
  weight: z.number().nonnegative(),
  reps: z.number().int().nonnegative(),
});
export type AddWeightAndRepsDto = z.infer<typeof addWeightAndRepsDto>;

export const markExercise = z.object({
  userId: z.uuid().transform((str) => str as UUID),
  workoutId: z.uuid().transform((str) => str as UUID),
  exerciseOrder: z.number().int().min(0),
});
export type MarkExercise = z.infer<typeof markExercise>;
