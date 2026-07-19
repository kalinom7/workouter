import { Collection, Db } from 'mongodb';
import { ExerciseRepository } from '../../../domain/exercise/ExerciseRepository.js';
import { Exercise } from '../../../domain/exercise/model/Exercise.js';
import { UUID } from 'node:crypto';
import { injectable } from 'inversify';

export type MongoExercise = Omit<Exercise, 'id'> & { _id: UUID };

@injectable()
export class MongoExerciseRepository extends ExerciseRepository {
  constructor(private readonly db: Db) {
    super();
  }
  private get collection(): Collection<MongoExercise> {
    return this.db.collection<MongoExercise>('exercises');
  }

  public async save(exercise: Exercise): Promise<void> {
    const mongoExercise = this.toMongoExercise(exercise);
    await this.collection.updateOne({ _id: mongoExercise._id }, { $set: mongoExercise }, { upsert: true });
  }

  public async get(exerciseId: UUID, userId: UUID): Promise<Exercise | null> {
    const mongoExercise = await this.collection.findOne({ _id: exerciseId, userId: userId });

    return mongoExercise ? this.toDomainExercise(mongoExercise) : null;
  }
  public async delete(exerciseId: UUID, userId: UUID): Promise<void> {
    await this.collection.deleteOne({ _id: exerciseId, userId: userId });
  }
  public async getAll(userId: UUID): Promise<Exercise[]> {
    const mongoExercises = await this.collection.find({ userId }).toArray();
    const domainExercises = mongoExercises.map((mongoExercise) => this.toDomainExercise(mongoExercise));

    return domainExercises;
  }

  private toDomainExercise(mongoExercise: MongoExercise): Exercise {
    const { _id, ...exerciseData } = mongoExercise;

    return { id: _id, ...exerciseData };
  }
  private toMongoExercise(exercise: Exercise): MongoExercise {
    const { id, ...exerciseData } = exercise;

    return { _id: id, ...exerciseData };
  }
}
