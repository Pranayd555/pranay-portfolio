import { createAction, props } from "@ngrx/store";
import { IEducationSection } from "../types/education.model";

export const getEducation = createAction('[Education] Get Education');

export const getEducationSuccess = createAction('[Education] Get Education Success', props<{ education: IEducationSection }>());

export const getEducationFailure = createAction('[Education] Get Education Failure', props<{ error: string }>());