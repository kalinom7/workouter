import { injectable } from 'inversify';
import { WorkoutRepository } from '../../../domain/workout/WorkoutRepository.js';
import { Workout } from '../../../domain/workout/model/Workout.js';
import { Collection, Db } from 'mongodb';
import { UUID } from 'node:crypto';

export type MongoWorkout = Omit<Workout, 'id'> & { _id: UUID };
@injectable()
export class MongoWorkoutRepository extends WorkoutRepository {
  constructor(private readonly db: Db) {
    super();
  }
  private get collection(): Collection<MongoWorkout> {
    return this.db.collection<MongoWorkout>('workouts');
  }
  public async get(workoutId: UUID, userId: UUID): Promise<Workout | null> {
    const mongoWorkout = await this.collection.findOne({ _id: workoutId, userId: userId });

    return mongoWorkout ? this.toDomainWorkout(mongoWorkout) : null;
  }
  public async getAllFinished(userId: UUID): Promise<Workout[] | null> {
    const mongoWorkouts = await this.collection.find({ userId: userId }).toArray();
    const domainWorkouts = mongoWorkouts.map((mongoWorkout) => this.toDomainWorkout(mongoWorkout));

    return domainWorkouts;
  }
  public async save(workout: Workout): Promise<void> {
    const mongoWorkout = this.toMongoWorkout(workout);
    await this.collection.updateOne(
      { _id: mongoWorkout._id, userId: workout.userId },
      { $set: mongoWorkout },
      { upsert: true },
    );
  }
  private toMongoWorkout(workout: Workout): MongoWorkout {
    const { id, ...workoutData } = workout;

    return { _id: id, ...workoutData };
  }
  private toDomainWorkout(mongoWorkout: MongoWorkout): Workout {
    const { _id, ...workoutData } = mongoWorkout;

    return { id: _id, ...workoutData };
  }
}
