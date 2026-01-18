import { createSelector } from "@ngrx/store";
import { AppStateInterface } from "../../../../../store/appState.interface";
import { IProjectsState } from "../types/projectsState.model";


export const selectProjects = (state: AppStateInterface) => state.projects;

export const isProjectsIsLoadingSelector = createSelector(selectProjects, (state: IProjectsState) => state.isLoading);
export const isProjectsHasErrorSelector = createSelector(selectProjects, (state: IProjectsState) => state.hasError);
export const getProjectsErrorMessageSelector = createSelector(selectProjects, (state: IProjectsState) => state.errorMessage);
export const getProjectsSelector = createSelector(selectProjects, (state: IProjectsState) => state.projects)