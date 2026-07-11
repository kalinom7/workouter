import { injectable } from 'inversify';
import { type WorkoutTemplate } from './model/WorkoutTemplate.js';
import { type WorkoutTemplateExercise } from './model/WorkoutTemplateExercise.js';
import { MongoConnection } from '../../application/MongoConnection.js';
import { UUID } from 'node:crypto';
import { Collection } from 'mongodb';

export abstract class WorkoutTemplateRepository {
  public abstract save(workoutTemplate: WorkoutTemplate): Promise<void>;
  public abstract saveWorkoutTemplateExercise(
    workoutTemplateId: string,
    userId: string,
    workoutTemplateExercise: WorkoutTemplateExercise,
  ): Promise<void>;
  public abstract get(workoutTemplateId: string, userId: string): Promise<WorkoutTemplate | null>;
  public abstract getAll(userId: string): Promise<WorkoutTemplate[]>;
  public abstract getByOrder(
    workoutTemplateId: string,
    userId: string,
    order: number,
  ): Promise<WorkoutTemplateExercise | null>;
  public abstract delete(workoutTemplateId: string, userId: string): Promise<void>;
  public abstract removeWorkoutTemplateExercise(
    workoutTemplateId: string,
    userId: string,
    order: number,
  ): Promise<void>;
}

@injectable()
export class MongoWorkoutTemplateRepository extends WorkoutTemplateRepository {
  constructor(private readonly mongoConnection: MongoConnection) {
    super();
  }

  private get collection(): Collection<WorkoutTemplate> {
    return this.mongoConnection.getDb().collection<WorkoutTemplate>('workoutTemplates');
  }

  public async save(workoutTemplate: WorkoutTemplate): Promise<void> {
    await this.collection.updateOne({ id: workoutTemplate.id }, { $set: workoutTemplate }, { upsert: true });
  }
  public async saveWorkoutTemplateExercise(
    workoutTemplateId: UUID,
    userId: UUID,
    workoutTemplateExercise: WorkoutTemplateExercise,
  ): Promise<void> {
    const result = await this.collection.updateOne(
      { id: workoutTemplateId, userId: userId, 'exercises.order': workoutTemplateExercise.order },
      { $set: { 'exercises.$': workoutTemplateExercise } },
    );
    if (result.matchedCount === 0) {
      throw new Error('Workout template exercise not found');
    }
  }
  public async get(workoutTemplateId: UUID, userId: UUID): Promise<WorkoutTemplate | null> {
    return this.collection.findOne({ id: workoutTemplateId, userId: userId }, { projection: { _id: 0 } });
  }
  public async getAll(userId: UUID): Promise<WorkoutTemplate[]> {
    return await this.collection.find({ userId }, { projection: { _id: 0 } }).toArray();
  }
  public async getByOrder(
    workoutTemplateId: UUID,
    userId: UUID,
    order: number,
  ): Promise<WorkoutTemplateExercise | null> {
    const result = await this.collection.findOne(
      { id: workoutTemplateId, userId: userId, 'exercises.order': order },
      { projection: { _id: 0, 'exercises.$': 1 } },
    );

    return result?.exercises[0] ?? null;
  }
  public async delete(workoutTemplateId: UUID, userId: UUID): Promise<void> {
    await this.collection.deleteOne({ id: workoutTemplateId, userId: userId });
  }
  public async removeWorkoutTemplateExercise(workoutTemplateId: UUID, userId: UUID, order: number): Promise<void> {
    await this.collection.updateOne(
      { id: workoutTemplateId, userId: userId },
      { $pull: { exercises: { order: order } } },
    );
  }
}

@injectable()
export class InMemoWorkoutTemplateRepository extends WorkoutTemplateRepository {
  private readonly workoutTemplates: Map<string, WorkoutTemplate> = new Map();
  private readonly workoutTemplateExercises: Map<string, WorkoutTemplateExercise[]> = new Map();

  public async save(workoutTemplate: WorkoutTemplate): Promise<void> {
    this.workoutTemplates.set(workoutTemplate.id, workoutTemplate);
    this.workoutTemplateExercises.set(workoutTemplate.id, workoutTemplate.exercises);
  }

  public async saveWorkoutTemplateExercise(
    workoutTemplateId: string,
    _userId: string,
    workoutTemplateExercise: WorkoutTemplateExercise,
  ): Promise<void> {
    const exercises = this.workoutTemplateExercises.get(workoutTemplateId) || [];
    const index = exercises.findIndex((e) => e.order === workoutTemplateExercise.order);

    if (index === -1) {
      throw new Error('WorkoutTemplateExercise not found');
    } else {
      exercises[index] = workoutTemplateExercise;
    }

    this.workoutTemplateExercises.set(workoutTemplateId, exercises);
  }

  public async get(workoutTemplateId: string, userId: string): Promise<WorkoutTemplate | null> {
    const workoutTemplate = this.workoutTemplates.get(workoutTemplateId);
    if (workoutTemplate && workoutTemplate.userId === userId) {
      return workoutTemplate;
    }

    return null;
  }

  public async getAll(userId: string): Promise<WorkoutTemplate[]> {
    const workoutTemplates: WorkoutTemplate[] = [];
    for (const workoutTemplate of this.workoutTemplates.values()) {
      if (workoutTemplate.userId === userId) {
        workoutTemplates.push(workoutTemplate);
      }
    }

    return workoutTemplates;
  }

  public async getByOrder(
    workoutTemplateId: string,
    _userId: string,
    order: number,
  ): Promise<WorkoutTemplateExercise | null> {
    const exercises = this.workoutTemplates.get(workoutTemplateId)?.exercises || [];
    const exercise = exercises.find((ex) => ex.order === order);
    if (exercise) {
      return exercise;
    }

    return null;
  }

  public async delete(workoutTemplateId: string, userId: string): Promise<void> {
    const workoutTemplate = this.workoutTemplates.get(workoutTemplateId);
    if (workoutTemplate && workoutTemplate.userId === userId) {
      this.workoutTemplates.delete(workoutTemplateId);
      this.workoutTemplateExercises.delete(workoutTemplateId);
    }
  }

  public async removeWorkoutTemplateExercise(workoutTemplateId: string, _userId: string, order: number): Promise<void> {
    const exercises = this.workoutTemplateExercises.get(workoutTemplateId) || [];
    const filteredExercises = exercises.filter((ex) => ex.order !== order);
    this.workoutTemplateExercises.set(workoutTemplateId, filteredExercises);
  }
}
