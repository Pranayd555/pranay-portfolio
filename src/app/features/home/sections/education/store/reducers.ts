import { createReducer, on } from "@ngrx/store";
import { IEducationState } from "../types/educationState.model";
import * as EducationActions from "./actions";

export const initialState: IEducationState = {
    education: {
        education: [],
        certifications: []
    },
    isLoading: false,
    hasError: false,
    errorMessage: ''
}

export const reducers = createReducer(initialState,
    on(EducationActions.getEducation, (state) => ({ ...state, isLoading: true })),
    on(EducationActions.getEducationSuccess, (state, action) => ({
        ...state,
        isLoading: false,
        hasError: false,
        errorMessage: '',
        education: action.education
    })),
    on(EducationActions.getEducationFailure, (state, action) => ({
        ...state,
        isLoading: false,
        hasError: true,
        errorMessage: action.error
    }))

)