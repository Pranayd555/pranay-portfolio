import { createSelector } from "@ngrx/store";
import { AppStateInterface } from "../../../../../store/appState.interface";
import { IEducationSection } from "../types/education.model";
import { IEducationState } from "../types/educationState.model";

export const selectEducation = (state: AppStateInterface) => state.education;

export const educationIsLoadingSelector = createSelector(selectEducation, (state: IEducationState) => state.isLoading);

export const educationHasErrorSelector = createSelector(selectEducation, (state: IEducationState) => state.hasError);

export const educationErrorMessageSelector = createSelector(selectEducation, (state: IEducationState) => state.errorMessage);

export const educationSelector = createSelector(selectEducation, (state: IEducationState) => state.education);

