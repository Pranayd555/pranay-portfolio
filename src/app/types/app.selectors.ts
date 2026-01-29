import { AppStateInterface } from "../store/appState.interface";

export const selectSkills = (state: AppStateInterface) => state.skills;
export const selectProjects = (state: AppStateInterface) => state.projects;
export const selectExperience = (state: AppStateInterface) => state.experience;
export const selectEducation = (state: AppStateInterface) => state.education;
export const selectProjectDetails = (state: AppStateInterface) => state.projectDetails;