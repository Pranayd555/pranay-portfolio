import { createReducer } from "@ngrx/store";
import { IProjectDetailsState } from "../../types/projectDetailsState.model";
import { on } from "@ngrx/store";
import * as ProjectDetailsActions from "./actions";



export const initialState: IProjectDetailsState = {
    isLoading: false,
    hasError: false,
    errorMessage: '',
    project: null
}

export const reducers = createReducer(initialState,
    on(ProjectDetailsActions.getProjectById, (state) => ({ ...state, isLoading: true, hasError: false, errorMessage: '' })),
    on(ProjectDetailsActions.getProjectByIdSuccess, (state, action) => ({ ...state, isLoading: false, project: action.project })),
    on(ProjectDetailsActions.getProjectByIdFailure, (state, action) => ({ ...state, isLoading: false, hasError: true, errorMessage: action.error, project: null })),
)