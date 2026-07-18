import { injectable } from 'inversify';
import { WorkoutScheduleRepository } from '../../../domain/workoutschedule/WorkoutScheduleRepository.js';
import { MongoConnection } from '../../MongoConnection.js';
import { WorkoutSchedule } from '../../../domain/workoutschedule/model/WorkoutSchedule.js';
import { Collection } from 'mongodb';
import { UUID } from 'node:crypto';

@injectable()
export class MongoWorkoutScheduleRepository extends WorkoutScheduleRepository {
  constructor(private readonly mongoConnection: MongoConnection) {
    super();
  }

  private get collection(): Collection<WorkoutSchedule> {
    return this.mongoConnection.getDb().collection<WorkoutSchedule>('workoutSchedules');
  }

  public override async save(workoutSchedule: WorkoutSchedule): Promise<void> {
    await this.collection.updateOne({ id: workoutSchedule.id }, { $set: workoutSchedule }, { upsert: true });
  }
  public override get(workoutScheduleId: UUID, userId: UUID): Promise<WorkoutSchedule | null> {
    return this.collection.findOne({ id: workoutScheduleId, userId: userId }, { projection: { _id: 0 } });
  }
  public override async getAll(userId: UUID): Promise<WorkoutSchedule[]> {
    return this.collection.find({ userId: userId }, { projection: { _id: 0 } }).toArray();
  }
  public override getActive(userId: UUID): Promise<WorkoutSchedule | null> {
    return this.collection.findOne({ userId: userId, isActive: true }, { projection: { _id: 0 } });
  }
  public override async delete(workoutScheduleId: UUID, userId: UUID): Promise<void> {
    await this.collection.deleteOne({ id: workoutScheduleId, userId: userId });
  }
}
