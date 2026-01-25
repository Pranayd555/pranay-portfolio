export interface ISkillCategory {
    id: string;
    title: string;
    icon: string;          // material-symbols name
    theme: 'primary' | 'secondary';
    skills: Skill[];
}

export interface Skill {
    name: string;
    icon: string;
}
