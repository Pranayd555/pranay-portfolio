import { createReducer, on } from "@ngrx/store";
import { ISkillsState } from "../types/skilsState.model";
import * as SkillsActions from "./actions";

export const initialState: ISkillsState = {
    isLoading: false,
    hasError: false,
    errorMessage: '',
    skills: []
}

export const reducers = createReducer(initialState,
    on(SkillsActions.getSkills, (state) => ({ ...state, isLoading: true })),
    on(SkillsActions.getSkillsSuccess, (state, action) => ({
        ...state,
        isLoading: false,
        skills: action.skills,
        hasError: false,
        errorMessage: ''
    })),
    on(SkillsActions.getSkillsFailure, (state, action) => ({
        ...state,
        isLoading: false,
        hasError: true,
        errorMessage: action.error
    }))
)