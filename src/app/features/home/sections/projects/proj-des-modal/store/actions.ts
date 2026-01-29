import { createAction, props } from "@ngrx/store";
import { IProjectDetails } from "../../types/projectDetails.model";



export const getProjectById = createAction('[ProjectDetails] Get project By Id', props<{ projectId: string }>());
export const getProjectByIdSuccess = createAction('[ProjectDetails] Get project By Id Success', props<{ project: IProjectDetails }>());
export const getProjectByIdFailure = createAction('[ProjectDetails] Get project By Id Failure', props<{ error: string }>());