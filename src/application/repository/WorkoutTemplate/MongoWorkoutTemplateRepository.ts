import { injectable } from 'inversify';
import { WorkoutTemplateRepository } from '../../../domain/workouttemplate/WorkoutTemplateRepository.js';
import { WorkoutTemplate } from '../../../domain/workouttemplate/model/WorkoutTemplate.js';
import { Collection, Db } from 'mongodb';
import { UUID } from 'node:crypto';
import { WorkoutTemplateExercise } from '../../../domain/workouttemplate/model/WorkoutTemplateExercise.js';

export type MongoWorkoutTemplate = Omit<WorkoutTemplate, 'id'> & { _id: UUID };
@injectable()
export class MongoWorkoutTemplateRepository extends WorkoutTemplateRepository {
  constructor(private readonly db: Db) {
    super();
  }

  private get collection(): Collection<MongoWorkoutTemplate> {
    return this.db.collection<MongoWorkoutTemplate>('workoutTemplates');
  }

  public async save(workoutTemplate: WorkoutTemplate): Promise<void> {
    const mongoWorkoutTemplate = this.toMongoWorkoutTemplate(workoutTemplate);
    await this.collection.updateOne(
      { _id: mongoWorkoutTemplate._id },
      { $set: mongoWorkoutTemplate },
      { upsert: true },
    );
  }
  public async saveWorkoutTemplateExercise(
    workoutTemplateId: UUID,
    userId: UUID,
    workoutTemplateExercise: WorkoutTemplateExercise,
  ): Promise<void> {
    const result = await this.collection.updateOne(
      { _id: workoutTemplateId, userId: userId, 'exercises.order': workoutTemplateExercise.order },
      { $set: { 'exercises.$': workoutTemplateExercise } },
    );
    if (result.matchedCount === 0) {
      throw new Error('Workout template exercise not found');
    }
  }
  public async get(workoutTemplateId: UUID, userId: UUID): Promise<WorkoutTemplate | null> {
    const mongoWorkoutTemplate = await this.collection.findOne({ _id: workoutTemplateId, userId: userId });

    return mongoWorkoutTemplate ? this.toDomainWorkoutTemplate(mongoWorkoutTemplate) : null;
  }
  public async getAll(userId: UUID): Promise<WorkoutTemplate[]> {
    const mongoWorkoutTemplates = await this.collection.find({ userId }).toArray();
    const domainWorkoutTemplates = mongoWorkoutTemplates.map((mongoWorkoutTemplate) =>
      this.toDomainWorkoutTemplate(mongoWorkoutTemplate),
    );

    return domainWorkoutTemplates;
  }
  public async getByOrder(
    workoutTemplateId: UUID,
    userId: UUID,
    order: number,
  ): Promise<WorkoutTemplateExercise | null> {
    const result = await this.collection.findOne(
      { _id: workoutTemplateId, userId: userId, 'exercises.order': order },
      { projection: { _id: 0, 'exercises.$': 1 } },
    );

    return result?.exercises[0] ?? null;
  }
  public async delete(workoutTemplateId: UUID, userId: UUID): Promise<void> {
    await this.collection.deleteOne({ _id: workoutTemplateId, userId: userId });
  }
  public async removeWorkoutTemplateExercise(workoutTemplateId: UUID, userId: UUID, order: number): Promise<void> {
    await this.collection.updateOne(
      { _id: workoutTemplateId, userId: userId },
      { $pull: { exercises: { order: order } } },
    );
  }
  private toMongoWorkoutTemplate(workoutTemplate: WorkoutTemplate): MongoWorkoutTemplate {
    const { id, ...workoutTemplateData } = workoutTemplate;

    return { _id: id, ...workoutTemplateData };
  }

  private toDomainWorkoutTemplate(mongoWorkoutTemplate: MongoWorkoutTemplate): WorkoutTemplate {
    const { _id, ...workoutTemplateData } = mongoWorkoutTemplate;

    return { id: _id, ...workoutTemplateData };
  }
}
