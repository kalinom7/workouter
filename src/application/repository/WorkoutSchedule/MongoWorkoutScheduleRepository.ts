import { injectable } from 'inversify';
import { WorkoutScheduleRepository } from '../../../domain/workoutschedule/WorkoutScheduleRepository.js';
import { WorkoutSchedule } from '../../../domain/workoutschedule/model/WorkoutSchedule.js';
import { Collection, Db, Filter } from 'mongodb';
import { UUID } from 'node:crypto';
import { WorkoutPatternItem } from '../../../domain/workoutschedule/model/WorkoutSchedulePattern.js';
import { MongoWorkoutTemplate } from '../WorkoutTemplate/MongoWorkoutTemplateRepository.js';

export type MongoWorkoutPatternItem = Omit<WorkoutPatternItem, 'workoutTemplate'> & { workoutTemplateId: UUID };
export type MongoWorkoutSchedule = Omit<WorkoutSchedule, 'id' | 'pattern'> & {
  _id: UUID;
  pattern: MongoWorkoutPatternItem[];
};

export type FilledMongoWorkoutPatternItem = Omit<MongoWorkoutPatternItem, 'workoutTemplateId'> & {
  workoutTemplate: MongoWorkoutTemplate;
};
export type FilledMongoWorkoutSchedule = Omit<MongoWorkoutSchedule, 'pattern'> & {
  pattern: FilledMongoWorkoutPatternItem[];
};
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
    const [filledMongoWorkoutSchedule] = await this.findFilledMongoWorkoutSchedule({ _id: workoutScheduleId, userId });

    return filledMongoWorkoutSchedule ? this.toDomainWorkoutSchedule(filledMongoWorkoutSchedule) : null;
  }

  public async getAll(userId: UUID): Promise<WorkoutSchedule[]> {
    const filledMongoWorkoutSchedules = await this.findFilledMongoWorkoutSchedule({ userId });
    const domainWorkoutSchedules = filledMongoWorkoutSchedules.map((filledMongoWorkoutSchedule) =>
      this.toDomainWorkoutSchedule(filledMongoWorkoutSchedule),
    );

    return domainWorkoutSchedules;
  }
  public async getActive(userId: UUID): Promise<WorkoutSchedule | null> {
    const [filledMongoWorkoutSchedule] = await this.findFilledMongoWorkoutSchedule({ userId, isActive: true });

    return filledMongoWorkoutSchedule ? this.toDomainWorkoutSchedule(filledMongoWorkoutSchedule) : null;
  }
  public async delete(workoutScheduleId: UUID, userId: UUID): Promise<void> {
    await this.collection.deleteOne({ _id: workoutScheduleId, userId: userId });
  }

  private toMongoWorkoutSchedule(workoutSchedule: WorkoutSchedule): MongoWorkoutSchedule {
    const { id, pattern, ...workoutScheduleData } = workoutSchedule;
    const mongoPattern = pattern.map((item) => {
      const { workoutTemplate, ...itemData } = item;

      return { ...itemData, workoutTemplateId: workoutTemplate.id };
    });

    return { _id: id, pattern: mongoPattern, ...workoutScheduleData };
  }

  private async findFilledMongoWorkoutSchedule(
    filter: Filter<MongoWorkoutSchedule>,
  ): Promise<FilledMongoWorkoutSchedule[]> {
    return this.collection
      .aggregate<FilledMongoWorkoutSchedule>([
        { $match: filter },
        {
          $lookup: {
            from: 'workoutTemplates',
            localField: 'pattern.workoutTemplateId',
            foreignField: '_id',
            as: 'workoutTemplates',
          },
        },
        {
          $addFields: {
            pattern: {
              $map: {
                input: '$pattern',
                as: 'item',
                in: {
                  $mergeObjects: [
                    {
                      id: '$$item.id',
                      order: '$$item.order',
                      useOrder: '$$item.useOrder',
                      restDays: '$$item.restDays',
                    },
                    {
                      workoutTemplate: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$workoutTemplates',
                              cond: { $eq: ['$$this._id', '$$item.workoutTemplateId'] },
                            },
                          },
                          0,
                        ],
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        { $project: { workoutTemplates: 0 } },
      ])
      .toArray();
  }
  private toDomainWorkoutSchedule(filledMongoWorkoutSchedule: FilledMongoWorkoutSchedule): WorkoutSchedule {
    const { _id, pattern, ...mongoWorkoutScheduleData } = filledMongoWorkoutSchedule;
    const domainPattern = pattern.map((item) => {
      const { _id, ...data } = item.workoutTemplate;
      const domainWorkoutTemplate = { id: _id, ...data };

      return { ...item, workoutTemplate: domainWorkoutTemplate };
    });

    return { id: _id, pattern: domainPattern, ...mongoWorkoutScheduleData };
  }
}
