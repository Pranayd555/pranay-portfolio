export interface IProjectDetails {
    id: string;
    title: string;
    shortDescription: string;

    overview: string;
    whyBuilt: string;
    problemsSolved: string[];

    keyFeatures: string[];
    showcasedSkills: string[];

    bottlenecksFaced: string[];
    howTheyWereSolved: string[];

    demoGif?: string; // path or URL
    demoVideo?: string; // path or URL
    liveUrl?: string;
    repoUrl?: string;

    technologies: string[];
}
