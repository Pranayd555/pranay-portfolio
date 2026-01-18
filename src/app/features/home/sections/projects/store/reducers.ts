import { createReducer, on } from "@ngrx/store";
import { IProjectsState } from "../types/projectsState.model";
import * as ProjectsActions from "./actions";

export const initialState: IProjectsState = {
    isLoading: false,
    hasError: false,
    errorMessage: '',
    projects: []
}

export const reducers = createReducer(initialState,
    on(ProjectsActions.getProjects, (state) => ({ ...state, isLoading: true })),
    on(ProjectsActions.getProjectsSuccess, (state, action) => ({ ...state, isLoading: false, projects: action.projects, hasError: false, errorMessage: '' })),
    on(ProjectsActions.getProjectsFailure, (state, action) => ({ ...state, isLoading: false, hasError: true, errorMessage: action.error }))
)