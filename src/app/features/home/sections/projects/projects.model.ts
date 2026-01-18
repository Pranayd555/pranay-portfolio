export interface IProject {
    id: string;
    title: string;
    description: string;
    icon?: string;              // material icon name
    technologies: string[];
    links: IProjectLinks;
    featured?: boolean;
}

export interface IProjectLinks {
    liveDemo?: string;
    sourceCode?: string;
}
