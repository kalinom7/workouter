import { expect, jest, test } from '@jest/globals';
import { randomUUID } from 'crypto';
import { WorkoutTemplate } from "../../../main/domain/workouttemplate/model/WorkoutTemplate.js";
//import { WorkoutTemplateExercise } from "../../main/domain/workouttemplate/model/WorkoutTemplateExercise.js";
import { WorkoutTemplateService } from "../../../main/domain/workouttemplate/WorkoutTemplateService.js";

//mock repository
const mockRepository  = {
    save: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
}


describe("WorkoutTemplateService", () => {
    let workoutTemplateService;
    
    beforeEach(() => {
        jest.clearAllMocks();
        workoutTemplateService = new WorkoutTemplateService(mockRepository);
    })

    test("should create workoutTemplate", () => {
        //given
        const id = randomUUID();
        const userId = randomUUID();
        const workoutTemplate = new WorkoutTemplate(id, "test workoutTemplate", userId, []);
        mockRepository.save.mockReturnValue(workoutTemplate);

        //when
        const createdWorkoutTemplate = workoutTemplateService.createWorkoutTemplate("test workoutTemplate", userId);

        //then 
        expect(createdWorkoutTemplate).toBe(workoutTemplate);
        expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
            id: expect.any(String),
            name: "test workoutTemplate",
            userId: userId,
            exercises: []
        }))
        expect(mockRepository.save).toHaveBeenCalledTimes(1);
        expect(createdWorkoutTemplate.id).toBeDefined();
        expect(createdWorkoutTemplate.name).toBe("test workoutTemplate");
        expect(createdWorkoutTemplate).toEqual(workoutTemplate);


    })

    test("should get workoutTemplate", () =>{
        //given
        const id = randomUUID();
        const userId = randomUUID();
        const workoutTemplate = new WorkoutTemplate (id, "test workoutTemplate", userId, []);
        mockRepository.get.mockReturnValue(workoutTemplate);

        //when
        const fetchedWorkoutTemplate = workoutTemplateService.getWorkoutTemplate(id, userId);
        
        //then
        expect(fetchedWorkoutTemplate).toBe(workoutTemplate);
        expect(mockRepository.get).toHaveBeenCalledWith(id, userId);
        expect(mockRepository.get).toHaveBeenCalledTimes(1);
        expect(fetchedWorkoutTemplate.id).toBe(id);
        expect(fetchedWorkoutTemplate.name).toBe("test workoutTemplate");
        expect(fetchedWorkoutTemplate.exercises).toEqual([]);
    })




    // needs fixing
    /*test("should add workoutTemplateExercise", () => { 
        //given
        const workoutTemplate = new WorkoutTemplate(randomUUID(), "test workoutTemplate", randomUUID(), []);
        //when
        workoutTemplateService.addWorkoutTemplateExercise("test exercise", workoutTemplate.id, workoutTemplate.userId);
        mockRepository.save.mockReturnValue(workoutTemplate);
        
        //then
        console.log(workoutTemplate);
        expect(mockRepository.get).toHaveBeenCalledWith(workoutTemplate.id, workoutTemplate.userId);
        expect(mockRepository.get).toHaveBeenCalledTimes(1);
       // expect(mockRepository.save).toHaveBeenCalledTimes(2);
        expect(workoutTemplate.exercises.length).toBe(1);
        expect(workoutTemplate.exercises[0].order).toBe(0);
        expect(workoutTemplate.exercises[0].name.name).toBe("test exercise");
        expect(workoutTemplate.exercises[0].sets).toBe(0);
        expect(workoutTemplate.exercises[0].reps).toBe(0);
    });*/

    });
    