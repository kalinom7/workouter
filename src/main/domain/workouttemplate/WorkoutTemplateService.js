import { randomUUID } from "crypto";
import { WorkoutTemplate } from "./model/WorkoutTemplate.js";
import { WorkoutTemplateExercise} from "./model/WorkoutTemplateExercise.js";
import { Exercise } from "../exercise/model/Exercise.js";

export class WorkoutTemplateService{
    constructor(workoutTemplateRepository){
        this.workoutTemplateRepository = workoutTemplateRepository;
    }

    //workoutTemplate creation
    createWorkoutTemplate(name, userId){
        const workoutTemplate = new WorkoutTemplate(randomUUID(), name, userId,[])
        return this.workoutTemplateRepository.save(workoutTemplate);
    }   

    //select a workoutTemplateExercise
    addWorkoutTemplateExercise(name, workoutTemplateId, userId){
       const  workoutTemplate = this.workoutTemplateRepository.get(workoutTemplateId, userId);
         if(!workoutTemplate){
          throw new Error("WorkoutTemplate not found");
         }
         const order = workoutTemplate.exercises.length;
         
         //think about why is there a new exercise no something choosen from some list
         const workoutTemplateExercise = new WorkoutTemplateExercise(new Exercise(name),0,0,order);

         workoutTemplate.exercises.push(workoutTemplateExercise);

        return this.workoutTemplateRepository.save(workoutTemplate);
    }

    //analyze if it makes sense
    setNumberOfSets(sets, workoutTemplateId, userId, order){
        const  workoutTemplate = this.workoutTemplateRepository.get(workoutTemplateId, userId);
        if(!workoutTemplate){
         throw new Error("WorkoutTemplate not found");
        }
        const workoutTemplateExercise = workoutTemplate.exercises.find(ex => ex.order === order);
        if(!workoutTemplateExercise){
            throw new Error("WorkoutTemplateExercise not found");
        }
        workoutTemplateExercise.sets = sets;

       return this.workoutTemplateRepository.save(workoutTemplate);
    }

    getWorkoutTemplate(workoutTemplateId, userId){
        return this.workoutTemplateRepository.get(workoutTemplateId, userId);
    }

    //delete
    deleteWorkoutTemplate(workoutTemplateId, userId){
        return this.workoutTemplateRepository.detele(workoutTemplateId, userId);
    }


}