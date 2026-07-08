import { Collection } from 'mongodb';
import { MongoConnection } from '../../application/MongoConnection.js';
import { type Exercise } from './model/Exercise.js';
import { injectable } from 'inversify';
import { UUID } from 'node:crypto';
export abstract class ExerciseRepository {
  public abstract save(exercise: Exercise): Promise<void>;

  public abstract get(exerciseId: string, userId: string): Promise<Exercise | null>;

  public abstract delete(exerciseId: string, userId: string): Promise<void>;

  public abstract getAll(userId: string): Promise<Exercise[]>;
}

@injectable()
export class MongoExerciseRepository extends ExerciseRepository {
  constructor(private readonly mongoConnection: MongoConnection) {
    super();
  }
  private get collection(): Collection<Exercise> {
    return this.mongoConnection.getDb().collection<Exercise>('exercises');
  }

  public async save(exercise: Exercise): Promise<void> {
    await this.collection.updateOne({ id: exercise.id }, { $set: exercise }, { upsert: true });
  }

  public async get(exerciseId: UUID, userId: UUID): Promise<Exercise | null> {
    return this.collection.findOne({ id: exerciseId, userId: userId }, { projection: { _id: 0 } });
  }
  public async delete(exerciseId: UUID, userId: UUID): Promise<void> {
    await this.collection.deleteOne({ id: exerciseId, userId: userId });
  }
  public async getAll(userId: UUID): Promise<Exercise[]> {
    return this.collection.find({ userId }, { projection: { _id: 0 } }).toArray();
  }
}

@injectable()
export class InMemoExerciseRepository extends ExerciseRepository {
  private readonly exercises: Map<string, Exercise> = new Map();

  public async save(exercise: Exercise): Promise<void> {
    this.exercises.set(exercise.id, exercise);
  }

  public async get(exerciseId: string, userId: string): Promise<Exercise | null> {
    const exercise = this.exercises.get(exerciseId);
    if (exercise && exercise.userId === userId) {
      return exercise;
    }

    return null;
  }

  public async getAll(userId: string): Promise<Exercise[]> {
    const exercises: Exercise[] = [];
    for (const exercise of this.exercises.values()) {
      if (exercise.userId === userId) {
        exercises.push(exercise);
      }
    }

    return exercises;
  }

  public async delete(exerciseId: string, userId: string): Promise<void> {
    const exercise = this.exercises.get(exerciseId);
    if (exercise && exercise.userId === userId) {
      this.exercises.delete(exerciseId);
    }
  }
}
