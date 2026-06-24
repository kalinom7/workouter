import { injectable } from 'inversify';
import { randomUUID, type UUID } from 'node:crypto';
import { type WorkoutSchedule } from './model/WorkoutSchedule.js';
import { WorkoutScheduleRepository } from './WorkoutScheduleRepository.js';

@injectable()
export class WorkoutScheduleService {
  constructor(private readonly workoutScheduleRepository: WorkoutScheduleRepository) {}
  public async create(name: string, userId: UUID): Promise<WorkoutSchedule> {
    const workoutSchedule: WorkoutSchedule = {
      isActive: false,
      id: randomUUID(),
      setActiveDate: null,
      name,
      userId: userId,
      pattern: [],
      lastOrder: null,
      lastFinishedWorkoutDate: null,
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
      workoutTemplateId: workoutTemplateId,
      restDays: 0,
    });
    await this.workoutScheduleRepository.save(workoutSchedule);

    return workoutSchedule;
  }
  public async addRestToPatternWorkout(
    userId: UUID,
    workoutScheduleId: UUID,
    patternItemId: UUID,
    restDays: number,
  ): Promise<WorkoutSchedule> {
    const workoutSchedule = await this.workoutScheduleRepository.get(workoutScheduleId, userId);
    if (workoutSchedule == null) {
      throw new Error('workout schedule not found');
    }
    const patternItem = workoutSchedule.pattern.find((b) => b.patternItemId === patternItemId);
    if (!patternItem) {
      throw new Error('Pattern item not found');
    }

    patternItem.restDays = restDays;
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
    const activeWorkoutSchedule = await this.workoutScheduleRepository.getActive(userId);
    if (workoutSchedule == null) {
      throw new Error('workout schedule not found');
    }
    if (activeWorkoutSchedule) {
      activeWorkoutSchedule.isActive = false;
      activeWorkoutSchedule.setActiveDate = null;
      await this.workoutScheduleRepository.save(activeWorkoutSchedule);
    }

    workoutSchedule.isActive = true;
    workoutSchedule.setActiveDate = new Date();
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

  public async rename(workoutScheduleId: UUID, userId: UUID, name: string): Promise<WorkoutSchedule> {
    const workoutSchedule = await this.workoutScheduleRepository.get(workoutScheduleId, userId);
    if (workoutSchedule == null) {
      throw new Error('workout schedule not found');
    }

    workoutSchedule.name = name;
    await this.workoutScheduleRepository.save(workoutSchedule);

    return workoutSchedule;
  }

  public async update(
    workoutScheduleId: UUID,
    userId: UUID,
    finishedTime: Date,
    finishedWorkoutTemplateId: UUID,
  ): Promise<WorkoutSchedule> {
    const workoutSchedule = await this.workoutScheduleRepository.get(workoutScheduleId, userId);
    if (workoutSchedule == null) {
      throw new Error('workout schedule not found');
    }
    const patternItem = workoutSchedule.pattern.find((b) => b.workoutTemplateId === finishedWorkoutTemplateId);
    if (!patternItem) {
      throw new Error('Pattern item not found');
    }

    workoutSchedule.lastOrder = patternItem.order;
    workoutSchedule.lastFinishedWorkoutDate = finishedTime;

    await this.workoutScheduleRepository.save(workoutSchedule);

    return workoutSchedule;
  }

  public async getScheduledActivity(userId: UUID): Promise<UUID | null> {
    const workoutSchedule = await this.workoutScheduleRepository.getActive(userId);
    if (workoutSchedule == null) {
      throw new Error('active workout schedule not found');
    }
    if (workoutSchedule.setActiveDate == null) {
      throw new Error('workout schedule is in invalid state: setActiveDate is null');
    }
    const setActiveDate = workoutSchedule.setActiveDate;
    const today = new Date();

    if (workoutSchedule.lastFinishedWorkoutDate === null && workoutSchedule.lastOrder === null) {
      const daysFromActiveDate = dateDiffInDays(setActiveDate, today);
      if (daysFromActiveDate > 1) {
        throw new Error('scheduled activity was skipped');
      }

      return workoutSchedule.pattern[0]?.workoutTemplateId ?? null;
    }
    if (workoutSchedule.lastFinishedWorkoutDate === null || workoutSchedule.lastOrder === null) {
      throw new Error('workout schedule is in invalid state: lastFinishedWorkoutDate or lastOrder is null');
    }

    const daysFromLastFinished = dateDiffInDays(workoutSchedule.lastFinishedWorkoutDate, today);
    const lastFinishedPatternItem = workoutSchedule.pattern.find((item) => item.order === workoutSchedule.lastOrder);
    if (!lastFinishedPatternItem) {
      throw new Error('workout schedule is in invalid state: last finished pattern item not found');
    }

    if (daysFromLastFinished > lastFinishedPatternItem.restDays) {
      throw new Error('scheduled activity was skipped');
    }
    if (daysFromLastFinished < lastFinishedPatternItem.restDays) {
      return null;
    }

    const nextPatternItem = workoutSchedule.pattern.find(
      (item) => item.order === (workoutSchedule.lastOrder! + 1) % workoutSchedule.pattern.length,
    );

    if (!nextPatternItem) {
      return null;
    }

    return nextPatternItem.workoutTemplateId;
  }
}

function dateDiffInDays(a: Date, b: Date): number {
  const _a = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const _b = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  const diffTime = _b.getTime() - _a.getTime();

  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}
