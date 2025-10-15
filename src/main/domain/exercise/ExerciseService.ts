import { randomUUID } from 'node:crypto';
import { type ExerciseRepository } from './ExerciseRepository.js';
import { type Exercise } from './model/Exercise.js';

export class ExerciseService {
  constructor(private readonly exerciseRepository: ExerciseRepository) {}

  public create(name: string, description: string, userId: string): Exercise {
    const exercise: Exercise = {
      id: randomUUID(),
      name,
      description,
      userId,
    };

    this.exerciseRepository.save(exercise);

    return exercise;
  }

  public get(exerciseId: string, userId: string): Exercise {
    return this.exerciseRepository.get(exerciseId, userId);
  }

  //add data validation?
  public update(exerciseId: string, name: string, description: string, userId: string): Exercise {
    const exercise: Exercise = {
      id: exerciseId,
      name,
      description,
      userId,
    };

    this.exerciseRepository.save(exercise);

    return exercise;
  }

  public delete(exerciseId: string, userId: string): void {
    this.exerciseRepository.delete(exerciseId, userId);
  }
}
