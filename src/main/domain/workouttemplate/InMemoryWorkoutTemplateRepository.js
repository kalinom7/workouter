export class InMemoryWorkoutTemplateRepository extends WorkoutTemplateRepository{
    constructor(){
        super();
        this.workoutTemplates = new Map();
    }
    save(workoutTemplate){
        this.workoutTemplates.set(workoutTemplate.id, workoutTemplate);
        return workoutTemplate;
    }
    get(workoutTemplateId, userId){
        return this.workoutTemplates.get(workoutTemplateId);
    }
    delete(workoutTemplateId, userId){
        this.workoutTemplates.delete(workoutTemplateId);
    }
}