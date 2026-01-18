import { AppStateInterface } from "../store/appState.interface";

export const selectSkills = (state: AppStateInterface) => state.skills;
export const selectProjects = (state: AppStateInterface) => state.projects;