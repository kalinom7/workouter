import { randomUUID, type UUID } from 'node:crypto';
import { type Workout } from './model/Workout.js';
import { type WorkoutRepository } from './WorkoutRepository.js';
import { type WorkoutTemplateService } from '../workouttemplate/WorkoutTemplateService.js';
import { type ExerciseService } from '../exercise/ExerciseService.js';
import { type WorkoutExerciseSet } from './model/WorkoutExerciseSet.js';
import { type WorkoutExercise } from './model/WorkoutExercise.js';
export class WorkoutService {
  constructor(
    private readonly workoutRepository: WorkoutRepository,
    private readonly workoutTemplateService: WorkoutTemplateService,
    private readonly exerciseService: ExerciseService,
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
    const workout = await this.workoutRepository.get(workoutId, userId);
    if (workout == null) {
      throw new Error('Workout not found');
    }
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
    const workout = await this.workoutRepository.get(workoutId, userId);
    if (workout == null) {
      throw new Error('Workout not found');
    }
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
    const workout = await this.workoutRepository.get(workoutId, userId);
    if (workout == null) {
      throw new Error('Workout not found');
    }
    const exercise = workout.exercises.find((e) => e.order === exerciseOrder);
    if (exercise == null) {
      throw new Error('Exercise not found in workout');
    }
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
    const workout = await this.workoutRepository.get(workoutId, userId);
    if (workout == null) {
      throw new Error('Workout not found');
    }
    const exercise = workout.exercises.find((e) => e.order === exerciseOrder);
    if (exercise == null) {
      throw new Error('Exercise not found in workout');
    }
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
    const workout = await this.workoutRepository.get(workoutId, userId);
    if (workout == null) {
      throw new Error('Workout not found');
    }
    const exercise = workout.exercises.find((e) => e.order === exerciseOrder);
    if (!exercise) {
      throw new Error('Exercise not found in workout');
    }

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
    const workout = await this.workoutRepository.get(workoutId, userId);
    if (workout == null) {
      throw new Error('Workout not found');
    }
    const exercise = workout.exercises.find((e) => e.order === exerciseOrder);
    if (exercise == null) {
      throw new Error('Exercise not found in workout');
    }
    const set = exercise.sets.find((s) => s.order === setOrder);
    if (set == null) {
      throw new Error('Set not found in exercise');
    }
    set.isCompleted = true;
    await this.workoutRepository.save(workout);
  }
  //mark set as uncompleted
  public async markSetAsUnCompleted(
    userId: UUID,
    workoutId: UUID,
    exerciseOrder: number,
    setOrder: number,
  ): Promise<void> {
    const workout = await this.workoutRepository.get(workoutId, userId);
    if (workout == null) {
      throw new Error('Workout not found');
    }
    const exercise = workout.exercises.find((e) => e.order === exerciseOrder);
    if (exercise == null) {
      throw new Error('Exercise not found in workout');
    }
    const set = exercise.sets.find((s) => s.order === setOrder);
    if (set == null) {
      throw new Error('Set not found in exercise');
    }
    set.isCompleted = false;
    await this.workoutRepository.save(workout);
  }
  //mark exercise as completed
  public async markExerciseAsCompleted(userId: UUID, workoutId: UUID, exerciseOrder: number): Promise<void> {
    const workout = await this.workoutRepository.get(workoutId, userId);
    if (workout == null) {
      throw new Error('Workout not found');
    }
    const exercise = workout.exercises.find((e) => e.order === exerciseOrder);
    if (exercise == null) {
      throw new Error('Exercise not found in workout');
    }
    exercise.isCompleted = true;
    await this.workoutRepository.save(workout);
  }
  //mark exercise as uncompleted
  public async markExerciseAsUnCompleted(userId: UUID, workoutId: UUID, exerciseOrder: number): Promise<void> {
    const workout = await this.workoutRepository.get(workoutId, userId);
    if (workout == null) {
      throw new Error('Workout not found');
    }
    const exercise = workout.exercises.find((e) => e.order === exerciseOrder);
    if (exercise == null) {
      throw new Error('Exercise not found in workout');
    }
    exercise.isCompleted = false;
    await this.workoutRepository.save(workout);
  }
  // finish workout
  public async finishWorkout(userId: UUID, workoutId: UUID, endTime: Date): Promise<void> {
    const workout = await this.workoutRepository.get(workoutId, userId);
    if (workout == null) {
      throw new Error('Workout not found');
    }
    workout.endTime = endTime;

    await this.workoutRepository.save(workout);
  }
}
