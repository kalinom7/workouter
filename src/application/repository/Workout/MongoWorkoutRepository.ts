import { injectable } from 'inversify';
import { WorkoutRepository } from '../../../domain/workout/WorkoutRepository.js';
import { MongoConnection } from '../../MongoConnection.js';
import { Workout } from '../../../domain/workout/model/Workout.js';
import { Collection } from 'mongodb';
import { UUID } from 'node:crypto';

@injectable()
export class MongoWorkoutRepository extends WorkoutRepository {
  constructor(private readonly mongoConnection: MongoConnection) {
    super();
  }
  private get collection(): Collection<Workout> {
    return this.mongoConnection.getDb().collection<Workout>('workouts');
  }
  public async get(workoutId: UUID, userId: UUID): Promise<Workout | null> {
    return this.collection.findOne({ id: workoutId, userId: userId }, { projection: { _id: 0 } });
  }
  public async getAllFinished(userId: UUID): Promise<Workout[] | null> {
    return this.collection.find({ userId: userId }, { projection: { _id: 0 } }).toArray();
  }
  public async save(workout: Workout): Promise<void> {
    await this.collection.updateOne({ id: workout.id, userId: workout.userId }, { $set: workout }, { upsert: true });
  }
}
