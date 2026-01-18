import { createSelector } from "@ngrx/store";
import { AppStateInterface } from "../../../../../store/appState.interface";
import { ISkillsState } from "../types/skilsState.model";

export const selectSkills = (state: AppStateInterface) => state.skills;

export const isLoadingSkillsSelector = createSelector(selectSkills, (state: ISkillsState) => state.isLoading);

export const skillsSelector = createSelector(selectSkills, (state: ISkillsState) => state.skills);

export const hasErrorSkillsSelector = createSelector(selectSkills, (state: ISkillsState) => state.hasError);

export const errorMessageSkillsSelector = createSelector(selectSkills, (state: ISkillsState) => state.errorMessage);