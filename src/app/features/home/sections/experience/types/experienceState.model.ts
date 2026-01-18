import { IExperience } from "./experience.model";

export interface IExperienceState {
    isLoading: boolean;
    hasError: boolean;
    errorMessage: string;
    experience: IExperience[];
}