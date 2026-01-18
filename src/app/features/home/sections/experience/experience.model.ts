export interface IExperience {
    id: string;
    role: string;
    company: string;
    location?: string;
    period: IExperiencePeriod;
    projects?: IExperienceProject[];
    highlights?: string[];
}

export interface IExperiencePeriod {
    start: string;   // ISO or display-friendly
    end: string;     // "Present" allowed
}

export interface IExperienceProject {
    name: string;
    client?: string;
    responsibilities: string[];
}
