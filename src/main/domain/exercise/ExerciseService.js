import { Exercise } from "./model/Exercise.js";
import { randomUUID } from "node:crypto";


export class ExerciseService{
    constructor(exerciseRepository){
        this.exerciseRepository = exerciseRepository;
    }
    
    create(name, description, userId){
        const exercise = new Exercise(randomUUID(), name, description, userId);
        return this.exerciseRepository.save(exercise);
    }

    get(exerciseId, userId){
        return this.exerciseRepository.get(exerciseId, userId); // check id type conversion
    }

    //add data validation?
    update(exerciseId, name, description, userId){
        const exercise = new Exercise(exerciseId, name, description, userId);
        return this.exerciseRepository.save(exercise);
    }
    delete(exerciseId, userId){
        return this.exerciseRepository.delete(exerciseId, userId);
    }
    
}