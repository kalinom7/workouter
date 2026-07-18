import { Collection } from 'mongodb';
import { ExerciseRepository } from '../../../domain/exercise/ExerciseRepository.js';
import { Exercise } from '../../../domain/exercise/model/Exercise.js';
import { MongoConnection } from '../../MongoConnection.js';
import { UUID } from 'node:crypto';
import { injectable } from 'inversify';

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
