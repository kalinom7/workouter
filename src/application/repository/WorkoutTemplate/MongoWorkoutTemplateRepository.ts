import { injectable } from 'inversify';
import { WorkoutTemplateRepository } from '../../../domain/workouttemplate/WorkoutTemplateRepository.js';
import { WorkoutTemplate } from '../../../domain/workouttemplate/model/WorkoutTemplate.js';
import { Collection, Db } from 'mongodb';
import { UUID } from 'node:crypto';
import { WorkoutTemplateExercise } from '../../../domain/workouttemplate/model/WorkoutTemplateExercise.js';

@injectable()
export class MongoWorkoutTemplateRepository extends WorkoutTemplateRepository {
  constructor(private readonly db: Db) {
    super();
  }

  private get collection(): Collection<WorkoutTemplate> {
    return this.db.collection<WorkoutTemplate>('workoutTemplates');
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
