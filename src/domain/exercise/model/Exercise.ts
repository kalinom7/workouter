import { type UUID } from 'node:crypto';

export type Exercise = {
  id: UUID;
  userId: UUID;
  name: string;
  description?: string | undefined;
};
