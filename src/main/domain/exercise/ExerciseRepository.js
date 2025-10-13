import { Exercise } from "./model/Exercise.js";

export class ExerciseRepository{
    save(exercise){
        throw new Error("Method (save) must be implemented");
    }
    get(exerciseId, userId){
        throw new Error("Method (get) must be implemented");
    }
    delete(exerciseId, userId){
        throw new Error("Method (delete) must be implemented");
    }
}