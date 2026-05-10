import { injectable } from 'inversify';
import { randomUUID, type UUID } from 'node:crypto';
import { type WorkoutSchedule } from './model/WorkoutSchedule.js';
import { WorkoutScheduleRepository } from './WorkoutScheduleRepository.js';
import { WorkoutRepository } from '../workout/WorkoutRepository.js';
import { Workout } from '../workout/model/Workout.js';
import { WorkoutPatternItem } from './model/WorkoutSchedulePattern.js';

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
    let workoutSchedule = await this.workoutScheduleRepository.get(workoutScheduleId, userId);

    if (workoutSchedule == null) {
      throw new Error('workout schedule not found');
    }
    if (workoutSchedule.isActive) {
      workoutSchedule = await this.adjustPatternOrder(workoutScheduleId, userId);
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
  /**
   * Uses private functions adjustOrderForRest and adjustOrderForWorkout.
   * Goal is to distinct time based order shift and event based order shift where the event
   * determining the shift is workout from schedule being found finished.
   *
   * Workout schedule is designed to be flexible for the user, with focus on workouts in pattern.
   * There could be some optimization to be done, for example hold original activateDate for the data
   * and reference date for searching done workouts.
   */
  public async adjustPatternOrder(workoutScheduleId: UUID, userId: UUID): Promise<WorkoutSchedule> {
    const workoutSchedule = await this.workoutScheduleRepository.get(workoutScheduleId, userId);
    let adjustedWorkoutSchedule: WorkoutSchedule;
    if (workoutSchedule === null || workoutSchedule.setActiveDate === null) {
      throw new Error('Incorrect workout schedule');
    }
    const templateIdsInPattern = workoutSchedule.pattern
      .filter((item) => item.type === 'workout' && item.workoutTemplateId !== null)
      .map((item) => item.workoutTemplateId);

    const lastDonePatternWorkout = await this.workoutRepository.findLastFinishedFromPattern(
      userId,
      templateIdsInPattern,
      workoutSchedule.setActiveDate,
    );
    if (lastDonePatternWorkout === null) {
      throw new Error('Last done pattern workout not found');
    }

    const currentItemFromPattern = workoutSchedule.pattern.find((item) => item.useOrder == 0);
    if (!currentItemFromPattern) {
      throw new Error('Schedule items could not be found');
    }

    if (currentItemFromPattern.type === 'rest') {
      adjustedWorkoutSchedule = this.adjustOrderForRest(
        workoutSchedule,
        lastDonePatternWorkout,
        currentItemFromPattern,
      );
    } else {
      adjustedWorkoutSchedule = this.adjustOrderForWorkout(workoutSchedule, lastDonePatternWorkout);
    }

    await this.workoutScheduleRepository.save(adjustedWorkoutSchedule);

    return adjustedWorkoutSchedule;
  }

  /**
   * Adjusting order for rest is based on time that passed since last matching
   * workout was done. In normal situation it should update useOrder every restDay
   * that passess. In case where user has done a workout and made more restDays than planned
   * scheduled is the next workout in pattern after restDays.
   * No matter how much time passed as rest, workout can't pass.
   */
  private adjustOrderForRest(
    workoutSchedule: WorkoutSchedule,
    lastDonePatternWorkout: Workout,
    currentItemFromPattern: WorkoutPatternItem,
  ): WorkoutSchedule {
    const today = new Date();
    let daysDiff: number = dateDiffInDays(lastDonePatternWorkout.endTime!, today);
    /**
     * next workout in pattern is item from pattern that is type workout and its workoutTemplate is diffrent than
     * workoutTemplate used in lastDonePatternWorkout
     */

    const lastDonePatternWorkoutItem = workoutSchedule.pattern.find(
      (item) => item.workoutTemplateId === lastDonePatternWorkout.usedWorkoutTemplate,
    );

    if (lastDonePatternWorkoutItem === undefined) {
      throw new Error('Error adjusting workout pattern with rest');
    }
    let nextWorkoutInPattern = workoutSchedule.pattern.find(
      (item) => item.type === 'workout' && item.order > lastDonePatternWorkoutItem.order,
    );

    /**if there isn't workout with order > lastDonePatternWorkoutOrder
     * that means that the next workout has to be searched from the start of the cycle
     */

    if (nextWorkoutInPattern === undefined) {
      nextWorkoutInPattern = workoutSchedule.pattern.find((item) => item.type === 'workout');

      if (nextWorkoutInPattern === undefined) {
        throw new Error('Error adjusting workout pattern with rest');
      }
    }

    /**check if lastDoneWorkout is the workout before restDay(s) if yes everything is correct,
     *  and we shif normally for restDays,
     *  if no that means pattern should be adjusted for the lastWorkoutDone as it is interfering correct order.
     */
    const lastDoneWorkoutBeforeRest = workoutSchedule.pattern.findLast(
      (item) => item.type === 'workout' && item.order < currentItemFromPattern.order,
    );

    const isBeforeRestSameToLastDone = lastDoneWorkoutBeforeRest?.order === lastDonePatternWorkoutItem.order;

    //pattern is adjusted to lastDone as 0 current order, and daysDiff += 1, it works correctly.
    if (!isBeforeRestSameToLastDone) {
      workoutSchedule.pattern = workoutSchedule.pattern.map((item) => ({
        ...item,
        useOrder:
          (((item.useOrder - lastDonePatternWorkoutItem.useOrder) % workoutSchedule.pattern.length) +
            workoutSchedule.pattern.length) %
          workoutSchedule.pattern.length,
      }));
      daysDiff += 1;
    }

    if (daysDiff > nextWorkoutInPattern.useOrder) {
      workoutSchedule.pattern = workoutSchedule.pattern.map((item) => ({
        ...item,
        useOrder:
          (((item.useOrder - nextWorkoutInPattern.useOrder) % workoutSchedule.pattern.length) +
            workoutSchedule.pattern.length) %
          workoutSchedule.pattern.length,
      }));
    } else {
      workoutSchedule.pattern = workoutSchedule.pattern.map((item) => ({
        ...item,
        useOrder: (item.useOrder - daysDiff + workoutSchedule.pattern.length) % workoutSchedule.pattern.length,
      }));
    }

    return workoutSchedule;
  }

  private adjustOrderForWorkout(workoutSchedule: WorkoutSchedule, lastDonePatternWorkout: Workout): WorkoutSchedule {
    const lastDonePatternItem = workoutSchedule.pattern.find(
      (item) => item.type === 'workout' && item.workoutTemplateId === lastDonePatternWorkout.usedWorkoutTemplate,
    );

    if (!lastDonePatternItem) {
      throw new Error('Error adjusting schedule for workout');
    }
    const shift = lastDonePatternItem.useOrder + 1;

    workoutSchedule.pattern = workoutSchedule.pattern.map((item) => ({
      ...item,
      useOrder: (item.useOrder - shift + workoutSchedule.pattern.length) % workoutSchedule.pattern.length,
    }));

    return workoutSchedule;
  }
}

function dateDiffInDays(a: Date, b: Date): number {
  const _a = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const _b = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  const diffTime = _b.getTime() - _a.getTime();

  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}
