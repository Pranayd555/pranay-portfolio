import { IProjectsState } from "../features/home/sections/projects/types/projectsState.model";
import { ISkillsState } from "../features/home/sections/skills/types/skilsState.model";

export interface AppStateInterface {
    skills: ISkillsState;
    projects: IProjectsState
}