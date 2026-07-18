import { injectable } from 'inversify';
import { WorkoutRepository } from '../../../domain/workout/WorkoutRepository.js';
import { Workout } from '../../../domain/workout/model/Workout.js';
import { Collection, Db } from 'mongodb';
import { UUID } from 'node:crypto';

@injectable()
export class MongoWorkoutRepository extends WorkoutRepository {
  constructor(private readonly db: Db) {
    super();
  }
  private get collection(): Collection<Workout> {
    return this.db.collection<Workout>('workouts');
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
