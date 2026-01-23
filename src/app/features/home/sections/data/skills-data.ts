import { ISkillCategory } from "../skills/types/skills.model";

export const skillsData: ISkillCategory[] = [
    {
        id: 'frontend-frameworks',
        title: 'Frontend Frameworks',
        icon: 'web',
        theme: 'primary',
        skills: [
            { name: 'Angular' },
            { name: 'React.js' },
            { name: 'Vue.js' }
        ]
    },
    {
        id: 'state-reactive',
        title: 'State Management & Reactive',
        icon: 'settings',
        theme: 'secondary',
        skills: [
            { name: 'RxJS' },
            { name: 'NgRx' },
            { name: 'Redux' }
        ]
    },
    {
        id: 'languages-core',
        title: 'Languages & Core Web',
        icon: 'code',
        theme: 'primary',
        skills: [
            { name: 'TypeScript' },
            { name: 'JavaScript (ES6+)' },
            { name: 'HTML5' },
            { name: 'CSS3' }
        ]
    },
    {
        id: 'backend-apis',
        title: 'Backend & APIs',
        icon: 'dns',
        theme: 'secondary',
        skills: [
            { name: 'Node.js' },
            { name: 'Express.js' },
            { name: 'REST APIs' }
        ]
    },
    {
        id: 'databases',
        title: 'Databases',
        icon: 'storage',
        theme: 'primary',
        skills: [
            { name: 'MongoDB' }
        ]
    },
    {
        id: 'styling-ui',
        title: 'Styling & UI',
        icon: 'palette',
        theme: 'secondary',
        skills: [
            { name: 'Tailwind CSS' },
            { name: 'Angular Material' },
            { name: 'Bootstrap' }
        ]
    },
    {
        id: 'cloud-devops',
        title: 'Cloud & DevOps',
        icon: 'cloud',
        theme: 'primary',
        skills: [
            { name: 'AWS S3' },
            { name: 'Cloudflare Pages' },
            { name: 'Vercel' },
            { name: 'Render' },
            { name: 'InterServer VPS' },
            { name: 'Nginx' }
        ]
    },
    {
        id: 'tools-productivity',
        title: 'Tools & Productivity',
        icon: 'build',
        theme: 'secondary',
        skills: [
            { name: 'Git' },
            { name: 'GitHub' },
            { name: 'Bitbucket' },
            { name: 'VS Code' },
            { name: 'Cursor' },
            { name: 'Trae' },
            { name: 'Antigravity' },
            { name: 'Azure' }
        ]
    }
];
