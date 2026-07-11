import { injectable } from 'inversify';
import { type WorkoutSchedule } from './model/WorkoutSchedule.js';
import { MongoConnection } from '../../application/MongoConnection.js';
import { Collection } from 'mongodb';
import { UUID } from 'node:crypto';

export abstract class WorkoutScheduleRepository {
  public abstract save(workoutSchedule: WorkoutSchedule): Promise<void>;
  public abstract get(workoutScheduleId: string, userId: string): Promise<WorkoutSchedule | null>;
  public abstract getAll(userId: string): Promise<WorkoutSchedule[]>;
  public abstract getActive(userId: string): Promise<WorkoutSchedule | null>;
  public abstract delete(workoutScheduleId: string, userId: string): Promise<void>;
}

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

@injectable()
export class InMemoWorkoutScheduleRepository extends WorkoutScheduleRepository {
  private readonly workoutSchedules: Map<string, WorkoutSchedule> = new Map();

  public async save(workoutSchedule: WorkoutSchedule): Promise<void> {
    this.workoutSchedules.set(workoutSchedule.id, workoutSchedule);
  }

  public async get(workoutScheduleId: string, userId: string): Promise<WorkoutSchedule | null> {
    const workoutSchedule = this.workoutSchedules.get(workoutScheduleId);
    if (workoutSchedule && workoutSchedule.userId === userId) {
      return workoutSchedule;
    }

    return null;
  }

  public async getAll(userId: string): Promise<WorkoutSchedule[]> {
    const workoutSchedules: WorkoutSchedule[] = [];
    for (const workoutSchedule of this.workoutSchedules.values()) {
      if (workoutSchedule.userId === userId) {
        workoutSchedules.push(workoutSchedule);
      }
    }

    return workoutSchedules;
  }

  public async delete(workoutScheduleId: string, userId: string): Promise<void> {
    const workoutSchedule = this.workoutSchedules.get(workoutScheduleId);
    if (workoutSchedule && workoutSchedule.userId === userId) {
      this.workoutSchedules.delete(workoutScheduleId);
    }
  }

  public async getActive(userId: string): Promise<WorkoutSchedule | null> {
    for (const workoutSchedule of this.workoutSchedules.values()) {
      if (workoutSchedule.userId === userId && workoutSchedule.isActive) {
        return workoutSchedule;
      }
    }

    return null;
  }
}
