import { createSelector } from "@ngrx/store";
import { AppStateInterface } from "../../../../../store/appState.interface";
import { ISkillsState } from "../types/skilsState.model";

export const selectSkills = (state: AppStateInterface) => state?.skills;

export const isLoadingSkillsSelector = createSelector(
  selectSkills,
  (state: ISkillsState | undefined) => state?.isLoading ?? true
);

export const skillsSelector = createSelector(
  selectSkills,
  (state: ISkillsState | undefined) => state?.skills ?? []
);

export const hasErrorSkillsSelector = createSelector(
  selectSkills,
  (state: ISkillsState | undefined) => state?.hasError ?? false
);

export const errorMessageSkillsSelector = createSelector(
  selectSkills,
  (state: ISkillsState | undefined) => state?.errorMessage ?? ''
);