import { randomUUID, type UUID } from 'node:crypto';
import { type Workout } from './model/Workout.js';
import { type WorkoutRepository } from './WorkoutRepository.js';
import { type WorkoutTemplateService } from '../workouttemplate/WorkoutTemplateService.js';
import { type ExerciseService } from '../exercise/ExerciseService.js';

export class WorkoutService {
  constructor(
    private readonly workoutRepository: WorkoutRepository,
    private readonly workoutTemplateService: WorkoutTemplateService,
    private readonly exerciseService: ExerciseService,
  ) {}

  public async startWorkout(startTime: Date, userId: UUID, workoutTemplateId: UUID): Promise<Workout> {
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

  public async addExercise(userId: UUID, workoutId: UUID, exerciseId: UUID): Promise<void> {
    const workout = await this.workoutRepository.get(workoutId, userId);

    const exercise = await this.exerciseService.get(exerciseId, userId);

    const order = workout.exercises.length;

    const workoutExercise = {
      exerciseId: exercise.id,
      sets: [],
      restPeriod: 0,
      order,
    };

    workout.exercises.push(workoutExercise);

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
}
