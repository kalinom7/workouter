import { randomUUID, type UUID } from 'node:crypto';
import { type ExerciseService } from '../exercise/ExerciseService.js';
import { type WorkoutTemplateService } from '../workouttemplate/WorkoutTemplateService.js';
import { type Workout } from './model/Workout.js';
import { type WorkoutExercise } from './model/WorkoutExercise.js';
import { type WorkoutExerciseSet } from './model/WorkoutExerciseSet.js';
import { type WorkoutRepository } from './WorkoutRepository.js';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types.js';
@injectable()
export class WorkoutService {
  constructor(
    @inject(TYPES.WorkoutRepository) private readonly workoutRepository: WorkoutRepository,
    @inject(TYPES.WorkoutTemplateService) private readonly workoutTemplateService: WorkoutTemplateService,
    @inject(TYPES.ExerciseService) private readonly exerciseService: ExerciseService,
  ) {}

  public async startWorkoutFromTemplate(startTime: Date, userId: UUID, workoutTemplateId: UUID): Promise<Workout> {
    const workoutTemplate = await this.workoutTemplateService.getWorkoutTemplate(workoutTemplateId, userId);
    const workout: Workout = {
      id: randomUUID(),
      userId,
      startTime,
      endTime: null,
      exercises: workoutTemplate.exercises.map((exercise) => ({
        exerciseId: exercise.exercise,
        sets: Array.from({ length: exercise.sets }).map((_, index) => ({
          weight: null,
          reps: null,
          order: index,
          isCompleted: false,
        })),
        restPeriod: exercise.restPeriod,
        order: exercise.order,
        isCompleted: false,
      })),
    };

    await this.workoutRepository.save(workout);

    return workout;
  }

  // start workout without template
  public async StartEmptyWorkout(startTime: Date, userId: UUID): Promise<Workout> {
    const workout: Workout = {
      id: randomUUID(),
      userId,
      startTime,
      endTime: null,
      exercises: [],
    };

    await this.workoutRepository.save(workout);

    return workout;
  }

  //add start workout from workoutschedule

  public async addExercise(userId: UUID, workoutId: UUID, exerciseId: UUID): Promise<void> {
    const workout = await this.getWorkout(workoutId, userId);
    const exercise = await this.exerciseService.get(exerciseId, userId);

    const order = workout.exercises.length;

    const workoutExercise: WorkoutExercise = {
      exerciseId: exercise.id,
      sets: [],
      restPeriod: 0,
      order,
      isCompleted: false,
    };

    workout.exercises.push(workoutExercise);

    await this.workoutRepository.save(workout);
  }

  // remove exercise
  public async removeExercise(userId: UUID, workoutId: UUID, exerciseOrder: number): Promise<void> {
    const workout = await this.getWorkout(workoutId, userId);
    const exerciseIndex = workout.exercises.findIndex((e) => e.order === exerciseOrder);
    if (exerciseIndex === -1) {
      throw new Error('Exercise not found in workout');
    }
    workout.exercises.splice(exerciseIndex, 1);
    let index = 0;
    for (const e of workout.exercises) {
      e.order = index++;
    }
    await this.workoutRepository.save(workout);
  }

  // add set to the exercise
  public async addSet(userId: UUID, workoutId: UUID, exerciseOrder: number): Promise<void> {
    const workout = await this.getWorkout(workoutId, userId);
    const exercise = this.getOrderedExercise(workout, exerciseOrder);
    const setOrder = exercise.sets.length;
    const newSet: WorkoutExerciseSet = {
      weight: null,
      reps: null,
      order: setOrder,
      isCompleted: false,
    };
    exercise.sets.push(newSet);
    await this.workoutRepository.save(workout);
  }

  //remove set from the exercise
  public async removeSet(userId: UUID, workoutId: UUID, exerciseOrder: number, setOrder: number): Promise<void> {
    const workout = await this.getWorkout(workoutId, userId);
    const exercise = this.getOrderedExercise(workout, exerciseOrder);
    const setIndex = exercise.sets.findIndex((s) => s.order === setOrder);
    if (setIndex === -1) {
      throw new Error('Set not found in exercise');
    }
    exercise.sets.splice(setIndex, 1);
    let index = 0;
    for (const s of exercise.sets) {
      s.order = index++;
    }
    await this.workoutRepository.save(workout);
  }

  public async addWeightAndReps(
    userId: UUID,
    workoutId: UUID,
    exerciseOrder: number,
    setOrder: number,
    weight: number,
    reps: number,
  ): Promise<void> {
    const workout = await this.getWorkout(workoutId, userId);
    const exercise = this.getOrderedExercise(workout, exerciseOrder);

    const set = exercise.sets.find((s) => s.order === setOrder);
    if (!set) {
      throw new Error('Set not found in exercise');
    }

    set.weight = weight;
    set.reps = reps;

    await this.workoutRepository.save(workout);
  }

  // mark set as completed
  public async markSetAsCompleted(
    userId: UUID,
    workoutId: UUID,
    exerciseOrder: number,
    setOrder: number,
  ): Promise<void> {
    const workout = await this.getWorkout(workoutId, userId);
    const exercise = this.getOrderedExercise(workout, exerciseOrder);
    const set = exercise.sets.find((s) => s.order === setOrder);
    if (set == null) {
      throw new Error('Set not found in exercise');
    }
    set.isCompleted = true;

    const allSetsCompleted = exercise.sets.every((s) => s.isCompleted);
    exercise.isCompleted = allSetsCompleted;

    await this.workoutRepository.save(workout);
  }
  //mark set as uncompleted
  public async markSetAsUnCompleted(
    userId: UUID,
    workoutId: UUID,
    exerciseOrder: number,
    setOrder: number,
  ): Promise<void> {
    const workout = await this.getWorkout(workoutId, userId);
    const exercise = this.getOrderedExercise(workout, exerciseOrder);
    const set = exercise.sets.find((s) => s.order === setOrder);
    if (set == null) {
      throw new Error('Set not found in exercise');
    }
    set.isCompleted = false;
    exercise.isCompleted = false;
    await this.workoutRepository.save(workout);
  }
  //mark exercise as completed
  public async markExerciseAsCompleted(userId: UUID, workoutId: UUID, exerciseOrder: number): Promise<void> {
    const workout = await this.getWorkout(workoutId, userId);
    const exercise = this.getOrderedExercise(workout, exerciseOrder);
    exercise.isCompleted = true;
    await this.workoutRepository.save(workout);
  }
  //mark exercise as uncompleted
  public async markExerciseAsUnCompleted(userId: UUID, workoutId: UUID, exerciseOrder: number): Promise<void> {
    const workout = await this.getWorkout(workoutId, userId);
    const exercise = this.getOrderedExercise(workout, exerciseOrder);
    exercise.isCompleted = false;
    await this.workoutRepository.save(workout);
  }

  // finish workout
  public async finishWorkout(userId: UUID, workoutId: UUID, endTime: Date): Promise<void> {
    const workout = await this.getWorkout(workoutId, userId);
    workout.endTime = endTime;

    await this.workoutRepository.save(workout);
  }

  public async getWorkout(workoutId: UUID, userId: UUID): Promise<Workout> {
    const workout = await this.workoutRepository.get(workoutId, userId);
    if (workout == null) {
      throw new Error('Workout not found');
    }

    return workout;
  }
  private getOrderedExercise(workoutId: UUID, userId: UUID, exerciseOrder: number): WorkoutExercise {
    const workout = this.getWorkout(workoutId, userId);
    const exercise = workout.exercises.find((e) => e.order === exerciseOrder);
    if (exercise == null) {
      throw new Error('Exercise not found in workout');
    }

    return exercise;
  }
}
