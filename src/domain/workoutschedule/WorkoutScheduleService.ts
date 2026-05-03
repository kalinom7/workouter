import { injectable } from 'inversify';
import { randomUUID, type UUID } from 'node:crypto';
import { type WorkoutSchedule } from './model/WorkoutSchedule.js';
import { WorkoutScheduleRepository } from './WorkoutScheduleRepository.js';
import { WorkoutRepository } from '../workout/WorkoutRepository.js';

@injectable()
export class WorkoutScheduleService {
  constructor(
    private readonly workoutScheduleRepository: WorkoutScheduleRepository,
    private readonly workoutRepository: WorkoutRepository,
  ) {}
  public async create(name: string, userId: UUID): Promise<WorkoutSchedule> {
    const workoutSchedule: WorkoutSchedule = {
      isActive: false,
      id: randomUUID(),
      setActiveDate: null,
      name,
      userId: userId,
      pattern: [],
    };

    await this.workoutScheduleRepository.save(workoutSchedule);

    return workoutSchedule;
  }
  public async get(workoutScheduleId: UUID, userId: UUID): Promise<WorkoutSchedule> {
    const workoutSchedule = await this.workoutScheduleRepository.get(workoutScheduleId, userId);
    if (workoutSchedule == null) {
      throw new Error('workout schedule not found');
    }

    return workoutSchedule;
  }

  public async adjustPatternOrder(workoutScheduleId: UUID, userId: UUID): Promise<WorkoutSchedule> {
    const workoutSchedule = await this.workoutScheduleRepository.get(workoutScheduleId, userId);
    if (workoutSchedule === null || workoutSchedule.setActiveDate === null) {
      throw new Error('Incorrect workout schedule');
    }
    const templateIdsInPattern = workoutSchedule.pattern
      .filter((item) => item.type === 'workout' && item.workoutTemplateId !== null)
      .map((item) => item.workoutTemplateId);

    const lastDoneWorkoutTemplate = await this.workoutRepository.findLastFinishedFromTemplate(
      userId,
      templateIdsInPattern,
      workoutSchedule.setActiveDate,
    );

    const lastIndex = workoutSchedule.pattern.findIndex(
      (item) => item.type === 'workout' && item.workoutTemplateId === lastDoneWorkoutTemplate,
    );

    const nextIndex = (lastIndex + 1) % workoutSchedule.pattern.length;

    workoutSchedule.pattern = workoutSchedule.pattern.map((item, index) => ({
      ...item,
      useOrder: (index - nextIndex + workoutSchedule.pattern.length) % workoutSchedule.pattern.length,
    }));

    await this.workoutScheduleRepository.save(workoutSchedule);

    return workoutSchedule;
  }

  public async getAll(userId: UUID): Promise<WorkoutSchedule[]> {
    const workoutSchedules = await this.workoutScheduleRepository.getAll(userId);

    return workoutSchedules;
  }

  public async delete(workoutScheduleId: UUID, userId: UUID): Promise<void> {
    const workoutSchedule = await this.workoutScheduleRepository.get(workoutScheduleId, userId);
    if (workoutSchedule == null) {
      throw new Error('workout schedule not found');
    }
    await this.workoutScheduleRepository.delete(workoutScheduleId, userId);
  }
  public async addWorkoutToPattern(
    workoutTemplateId: UUID,
    userId: UUID,
    workoutScheduleId: UUID,
  ): Promise<WorkoutSchedule> {
    const workoutSchedule = await this.workoutScheduleRepository.get(workoutScheduleId, userId);
    if (workoutSchedule == null) {
      throw new Error('workout schedule not found');
    }
    workoutSchedule.pattern.push({
      patternItemId: randomUUID(),
      order: workoutSchedule.pattern.length,
      useOrder: workoutSchedule.pattern.length,
      type: 'workout',
      workoutTemplateId: workoutTemplateId,
    });
    await this.workoutScheduleRepository.save(workoutSchedule);

    return workoutSchedule;
  }
  public async addRestToPattern(userId: UUID, workoutScheduleId: UUID): Promise<WorkoutSchedule> {
    const workoutSchedule = await this.workoutScheduleRepository.get(workoutScheduleId, userId);
    if (workoutSchedule == null) {
      throw new Error('workout schedule not found');
    }
    workoutSchedule.pattern.push({
      patternItemId: randomUUID(),
      order: workoutSchedule.pattern.length,
      useOrder: workoutSchedule.pattern.length,
      type: 'rest',
      workoutTemplateId: null,
    });
    await this.workoutScheduleRepository.save(workoutSchedule);

    return workoutSchedule;
  }
  public async removePatternItem(userId: UUID, workoutScheduleId: UUID, itemId: UUID): Promise<WorkoutSchedule> {
    const workoutSchedule = await this.workoutScheduleRepository.get(workoutScheduleId, userId);
    if (workoutSchedule == null) {
      throw new Error('workout schedule not found');
    }

    const found = workoutSchedule.pattern.some((b) => b.patternItemId === itemId);
    if (!found) {
      throw new Error('Pattern item not found');
    }

    workoutSchedule.pattern = workoutSchedule.pattern.filter((b) => b.patternItemId !== itemId);

    workoutSchedule.pattern = workoutSchedule.pattern
      .toSorted((a, b) => a.order - b.order)
      .map((pattern, index) => ({
        ...pattern,
        order: index,
      }));

    await this.workoutScheduleRepository.save(workoutSchedule);

    return workoutSchedule;
  }

  public async setActive(workoutScheduleId: UUID, userId: UUID): Promise<WorkoutSchedule> {
    const workoutSchedule = await this.workoutScheduleRepository.get(workoutScheduleId, userId);
    if (workoutSchedule == null) {
      throw new Error('workout schedule not found');
    }

    workoutSchedule.isActive = true;
    await this.workoutScheduleRepository.save(workoutSchedule);

    return workoutSchedule;
  }
  public async setInactive(workoutScheduleId: UUID, userId: UUID): Promise<WorkoutSchedule> {
    const workoutSchedule = await this.workoutScheduleRepository.get(workoutScheduleId, userId);
    if (workoutSchedule == null) {
      throw new Error('workout schedule not found');
    }

    workoutSchedule.isActive = false;
    await this.workoutScheduleRepository.save(workoutSchedule);

    return workoutSchedule;
  }
}
