import { injectable } from 'inversify';
import { type Workout } from './model/Workout.js';
import { Collection } from 'mongodb';
import { MongoConnection } from '../../application/MongoConnection.js';
import { UUID } from 'node:crypto';

export abstract class WorkoutRepository {
  public abstract get(workoutId: string, userId: string): Promise<Workout | null>;
  public abstract getAllFinished(userId: string): Promise<Workout[] | null>;
  public abstract save(workout: Workout): Promise<void>;
}

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
@injectable()
export class InMemoWorkoutRepository extends WorkoutRepository {
  private readonly workouts: Map<string, Workout> = new Map();

  public async get(workoutId: string, userId: string): Promise<Workout | null> {
    const workout = this.workouts.get(workoutId);
    if (workout && workout.userId === userId) {
      return workout;
    }

    return null;
  }

  public async getAllFinished(userId: string): Promise<Workout[]> {
    const allWorkouts: Workout[] = [];
    for (const workout of this.workouts.values()) {
      if (workout.userId === userId && workout.endTime !== null) {
        allWorkouts.push(workout);
      }
    }

    return allWorkouts;
  }

  public async save(workout: Workout): Promise<void> {
    this.workouts.set(workout.id, workout);
  }
}
