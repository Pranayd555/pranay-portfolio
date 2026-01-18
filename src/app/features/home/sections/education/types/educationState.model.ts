import { IEducationSection } from "./education.model";

export interface IEducationState {
    education: IEducationSection;
    isLoading: boolean;
    hasError: boolean;
    errorMessage: string;
}