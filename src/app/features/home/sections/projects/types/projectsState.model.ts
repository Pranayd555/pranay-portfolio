import { IProject } from "./projects.model";

export interface IProjectsState {
    isLoading: boolean;
    hasError: boolean;
    errorMessage: string;
    projects: IProject[];
}