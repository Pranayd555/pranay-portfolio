import { createSelector } from "@ngrx/store";
import { AppStateInterface } from "../../../../../store/appState.interface";
import { IExperienceState } from "../types/experienceState.model";

export const selectExperience = (state: AppStateInterface) => state?.experience;

export const experienceIsLoadingSelector = createSelector(
  selectExperience,
  (state: IExperienceState | undefined) => state?.isLoading ?? true
);
export const experienceHasErrorSelector = createSelector(
  selectExperience,
  (state: IExperienceState | undefined) => state?.hasError ?? false
);
export const experienceErrorMessageSelector = createSelector(
  selectExperience,
  (state: IExperienceState | undefined) => state?.errorMessage ?? ''
);
export const experienceSelector = createSelector(
  selectExperience,
  (state: IExperienceState | undefined) => state?.experience ?? []
);