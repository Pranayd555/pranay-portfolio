import { createSelector } from "@ngrx/store";
import { AppStateInterface } from "../../../../../../store/appState.interface";
import { IProjectDetailsState } from "../../types/projectDetailsState.model";


export const selectProjectDetailsState = (state: AppStateInterface) => state.projectDetails;


export const selectProjectDetailsIsLoading = createSelector(selectProjectDetailsState, (state: IProjectDetailsState) => state.isLoading);
export const selectProjectDetailsHasError = createSelector(selectProjectDetailsState, (state: IProjectDetailsState) => state.hasError);
export const selectProjectDetailsErrorMessage = createSelector(selectProjectDetailsState, (state: IProjectDetailsState) => state.errorMessage);
export const selectProjectDetails = createSelector(selectProjectDetailsState, (state: IProjectDetailsState) => state.project);
