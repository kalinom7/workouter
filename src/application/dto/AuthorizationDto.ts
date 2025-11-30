import { type UUID } from 'node:crypto';
import z from 'zod';

export const authorizationDto = z.object({
  userId: z.uuid().transform((str) => str as UUID),
});
export type AuthorizationDto = z.infer<typeof authorizationDto>;
