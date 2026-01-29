import { IProjectDetails } from "./projectDetails.model";


export interface IProjectDetailsState {
    isLoading: boolean;
    hasError: boolean;
    errorMessage: string;
    project: IProjectDetails | null;
}