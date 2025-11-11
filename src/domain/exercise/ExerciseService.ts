import { randomUUID, type UUID } from 'node:crypto';
import { type ExerciseRepository } from './ExerciseRepository.js';
import { type Exercise } from './model/Exercise.js';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types.js';
@injectable()
export class ExerciseService {
  constructor(
    @inject(TYPES.ExerciseRepository)
    private readonly exerciseRepository: ExerciseRepository,
  ) {}

  public async create(name: string, userId: UUID, description?: string): Promise<Exercise> {
    const exercise: Exercise = {
      id: randomUUID(),
      name,
      userId,
      description,
    };

    await this.exerciseRepository.save(exercise);

    return exercise;
  }

  public async get(exerciseId: UUID, userId: UUID): Promise<Exercise> {
    const exercise = await this.exerciseRepository.get(exerciseId, userId);
    if (exercise == null) {
      throw new Error('exercise not found');
    }

    return exercise;
  }

  public async update(exerciseId: UUID, name: string, description: string, userId: UUID): Promise<Exercise> {
    const exercise: Exercise = {
      id: exerciseId,
      name,
      description,
      userId,
    };

    await this.exerciseRepository.save(exercise);

    return exercise;
  }

  public async delete(exerciseId: string, userId: string): Promise<void> {
    const exercise = await this.exerciseRepository.get(exerciseId, userId);
    if (exercise == null) {
      throw new Error('exercise not found');
    }
    await this.exerciseRepository.delete(exerciseId, userId);
  }
}
