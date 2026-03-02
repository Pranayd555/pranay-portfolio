import { createSelector } from "@ngrx/store";
import { AppStateInterface } from "../../../../../store/appState.interface";
import { IProjectsState } from "../types/projectsState.model";


export const selectProjects = (state: AppStateInterface) => state?.projects;

export const isProjectsIsLoadingSelector = createSelector(
  selectProjects,
  (state: IProjectsState | undefined) => state?.isLoading ?? true
);
export const isProjectsHasErrorSelector = createSelector(
  selectProjects,
  (state: IProjectsState | undefined) => state?.hasError ?? false
);
export const getProjectsErrorMessageSelector = createSelector(
  selectProjects,
  (state: IProjectsState | undefined) => state?.errorMessage ?? ''
);
export const getProjectsSelector = createSelector(
  selectProjects,
  (state: IProjectsState | undefined) => state?.projects ?? []
);