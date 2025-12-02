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
      name,
      userId: userId,
      block: [],
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
  public async delete(workoutScheduleId: UUID, userId: UUID): Promise<void> {
    const workoutSchedule = await this.workoutScheduleRepository.get(workoutScheduleId, userId);
    if (workoutSchedule == null) {
      throw new Error('workout schedule not found');
    }
    await this.workoutScheduleRepository.delete(workoutScheduleId, userId);
  }
  public async addWorkoutToBlock(
    workoutTemplateId: UUID,
    userId: UUID,
    workoutScheduleId: UUID,
  ): Promise<WorkoutSchedule> {
    const workoutSchedule = await this.workoutScheduleRepository.get(workoutScheduleId, userId);
    if (workoutSchedule == null) {
      throw new Error('workout schedule not found');
    }
    workoutSchedule.block.push({
      blockItemId: randomUUID(),
      order: workoutSchedule.block.length,
      type: 'workouttemplate',
      WorkoutTemplateId: workoutTemplateId,
    });
    await this.workoutScheduleRepository.save(workoutSchedule);

    return workoutSchedule;
  }
  public async addRestToBlock(restPeriod: number, userId: UUID, workoutScheduleId: UUID): Promise<WorkoutSchedule> {
    const workoutSchedule = await this.workoutScheduleRepository.get(workoutScheduleId, userId);
    if (workoutSchedule == null) {
      throw new Error('workout schedule not found');
    }
    workoutSchedule.block.push({
      blockItemId: randomUUID(),
      order: workoutSchedule.block.length,
      type: 'rest',
      period: restPeriod,
    });
    await this.workoutScheduleRepository.save(workoutSchedule);

    return workoutSchedule;
  }
  public async removeBlockItem(userId: UUID, workoutScheduleId: UUID, itemId: UUID): Promise<WorkoutSchedule> {
    const workoutSchedule = await this.workoutScheduleRepository.get(workoutScheduleId, userId);
    if (workoutSchedule == null) {
      throw new Error('workout schedule not found');
    }

    const found = workoutSchedule.block.some((b) => b.blockItemId === itemId);
    if (!found) {
      throw new Error('block item not found');
    }

    workoutSchedule.block = workoutSchedule.block.filter((b) => b.blockItemId !== itemId);

    workoutSchedule.block = workoutSchedule.block
      .toSorted((a, b) => a.order - b.order)
      .map((block, index) => ({
        ...block,
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
