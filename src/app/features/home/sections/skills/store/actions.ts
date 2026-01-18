import { createAction, props } from '@ngrx/store';
import { ISkillCategory } from '../types/skills.model';

export const getSkills = createAction('[Skills] Get skills');
export const getSkillsSuccess = createAction('[Skills] Get skills success', props<{ skills: ISkillCategory[] }>());
export const getSkillsFailure = createAction('[Skills] Get skills failure', props<{ error: string }>());