import { createSelector } from "@ngrx/store";
import { AppStateInterface } from "../../../../../store/appState.interface";
import { IExperienceState } from "../types/experienceState.model";

export const selectExperience = (state: AppStateInterface) => state.experience;

export const experienceIsLoadingSelector = createSelector(selectExperience, (state: IExperienceState) => state.isLoading);
export const experienceHasErrorSelector = createSelector(selectExperience, (state: IExperienceState) => state.hasError);
export const experienceErrorMessageSelector = createSelector(selectExperience, (state: IExperienceState) => state.errorMessage);
export const experienceSelector = createSelector(selectExperience, (state: IExperienceState) => state.experience);