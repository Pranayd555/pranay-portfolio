import { IEducationState } from "../features/home/sections/education/types/educationState.model";
import { IExperienceState } from "../features/home/sections/experience/types/experienceState.model";
import { IProjectDetailsState } from "../features/home/sections/projects/types/projectDetailsState.model";
import { IProjectsState } from "../features/home/sections/projects/types/projectsState.model";
import { ISkillsState } from "../features/home/sections/skills/types/skilsState.model";

export interface AppStateInterface {
    skills: ISkillsState;
    projects: IProjectsState;
    experience: IExperienceState;
    education: IEducationState;
    projectDetails: IProjectDetailsState;
}