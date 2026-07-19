import { injectable } from 'inversify';
import { WorkoutScheduleRepository } from '../../../domain/workoutschedule/WorkoutScheduleRepository.js';
import { WorkoutSchedule } from '../../../domain/workoutschedule/model/WorkoutSchedule.js';
import { Collection, Db } from 'mongodb';
import { UUID } from 'node:crypto';

export type MongoWorkoutSchedule = Omit<WorkoutSchedule, 'id'> & { _id: UUID };
@injectable()
export class MongoWorkoutScheduleRepository extends WorkoutScheduleRepository {
  constructor(private readonly db: Db) {
    super();
  }

  private get collection(): Collection<MongoWorkoutSchedule> {
    return this.db.collection<MongoWorkoutSchedule>('workoutSchedules');
  }

  public async save(workoutSchedule: WorkoutSchedule): Promise<void> {
    const mongoWorkoutSchedule = this.toMongoWorkoutSchedule(workoutSchedule);
    await this.collection.updateOne(
      { _id: mongoWorkoutSchedule._id },
      { $set: mongoWorkoutSchedule },
      { upsert: true },
    );
  }
  public async get(workoutScheduleId: UUID, userId: UUID): Promise<WorkoutSchedule | null> {
    const mongoWorkoutSchedule = await this.collection.findOne({ _id: workoutScheduleId, userId: userId });

    return mongoWorkoutSchedule ? this.toDomainWorkoutSchedule(mongoWorkoutSchedule) : null;
  }
  public async getAll(userId: UUID): Promise<WorkoutSchedule[]> {
    const mongoWorkoutSchedules = await this.collection.find({ userId: userId }).toArray();
    const domainWorkoutSchedules = mongoWorkoutSchedules.map((mongoWorkoutSchedule) =>
      this.toDomainWorkoutSchedule(mongoWorkoutSchedule),
    );

    return domainWorkoutSchedules;
  }
  public async getActive(userId: UUID): Promise<WorkoutSchedule | null> {
    const mongoWorkoutSchedule = await this.collection.findOne({ userId: userId, isActive: true });

    return mongoWorkoutSchedule ? this.toDomainWorkoutSchedule(mongoWorkoutSchedule) : null;
  }
  public async delete(workoutScheduleId: UUID, userId: UUID): Promise<void> {
    await this.collection.deleteOne({ _id: workoutScheduleId, userId: userId });
  }

  private toMongoWorkoutSchedule(workoutSchedule: WorkoutSchedule): MongoWorkoutSchedule {
    const { id, ...workoutScheduleData } = workoutSchedule;

    return { _id: id, ...workoutScheduleData };
  }
  private toDomainWorkoutSchedule(mongoWorkoutSchedule: MongoWorkoutSchedule): WorkoutSchedule {
    const { _id, ...workoutScheduleData } = mongoWorkoutSchedule;

    return { id: _id, ...workoutScheduleData };
  }
}
