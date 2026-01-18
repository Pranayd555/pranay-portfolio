import { createAction, props } from "@ngrx/store";
import { IExperience } from "../types/experience.model";

export const getExperience = createAction('[Experience] Get Experience');

export const getExperienceSuccess = createAction('[Experience] Get Experience Success', props<{ experience: IExperience[] }>());

export const getExperienceFailure = createAction('[Experience] Get Experience Failure', props<{ error: string }>());