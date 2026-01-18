import { createReducer, on } from "@ngrx/store";
import { IExperienceState } from "../types/experienceState.model";
import * as ExperienceActions from "./actions";

export const initialState: IExperienceState = {
    isLoading: false,
    hasError: false,
    errorMessage: '',
    experience: []
}

export const reducers = createReducer(initialState,
    on(ExperienceActions.getExperience, (state) => ({ ...state, isLoading: true })),
    on(ExperienceActions.getExperienceSuccess, (state, action) => ({
        ...state,
        isLoading: false,
        experience: action.experience,
        hasError: false,
        errorMessage: ''
    })),
    on(ExperienceActions.getExperienceFailure, (state, action) => ({
        ...state,
        isLoading: false,
        hasError: true,
        errorMessage: action.error
    }))
)