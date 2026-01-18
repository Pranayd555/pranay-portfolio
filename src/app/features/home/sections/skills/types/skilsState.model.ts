import { ISkillCategory } from "./skills.model";

export interface ISkillsState {
    isLoading: boolean;
    hasError: boolean;
    errorMessage: string;
    skills: ISkillCategory[];
}