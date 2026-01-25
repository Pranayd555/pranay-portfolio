import { ISkillCategory } from "../skills/types/skills.model";

export const skillsData: ISkillCategory[] = [
    {
        id: 'frontend-frameworks',
        title: 'Frontend Frameworks',
        icon: 'web',
        theme: 'primary',
        skills: [
            {
                name: 'Angular',
                icon: 'assets/skill-icons/angular-original.svg'
            },
            {
                name: 'React.js',
                icon: 'assets/skill-icons/react-original.svg'
            },
            {
                name: 'Vue.js',
                icon: 'assets/skill-icons/vuejs-original.svg'
            }
        ]
    },
    {
        id: 'state-reactive',
        title: 'State Management & Reactive',
        icon: 'settings',
        theme: 'secondary',
        skills: [
            {
                name: 'RxJS',
                icon: 'assets/skill-icons/rxjs-original.svg'
            },
            {
                name: 'NgRx',
                icon: 'assets/skill-icons/ngrx-original.svg'
            },
            {
                name: 'Redux',
                icon: 'assets/skill-icons/redux-original.svg'
            }
        ]
    },
    {
        id: 'languages-core',
        title: 'Languages & Core Web',
        icon: 'code',
        theme: 'primary',
        skills: [
            {
                name: 'TypeScript',
                icon: 'assets/skill-icons/typescript-original.svg'
            },
            {
                name: 'JavaScript (ES6+)',
                icon: 'assets/skill-icons/javascript-original.svg'
            },
            {
                name: 'HTML5',
                icon: 'assets/skill-icons/html5-original.svg'
            },
            {
                name: 'CSS3',
                icon: 'assets/skill-icons/css3-original.svg'
            }
        ]
    },
    {
        id: 'backend-apis',
        title: 'Backend & APIs',
        icon: 'dns',
        theme: 'secondary',
        skills: [
            {
                name: 'Node.js',
                icon: 'assets/skill-icons/nodejs-original.svg'
            },
            {
                name: 'Express.js',
                icon: 'assets/skill-icons/express-original.svg'
            },
            {
                name: 'REST APIs',
                icon: ''
            }
        ]
    },
    {
        id: 'databases',
        title: 'Databases',
        icon: 'storage',
        theme: 'primary',
        skills: [
            {
                name: 'MongoDB',
                icon: 'assets/skill-icons/mongodb-original.svg'
            }
        ]
    },
    {
        id: 'styling-ui',
        title: 'Styling & UI',
        icon: 'palette',
        theme: 'secondary',
        skills: [
            {
                name: 'Tailwind CSS',
                icon: 'assets/skill-icons/tailwindcss-original.svg'
            },
            {
                name: 'Angular Material',
                icon: 'assets/skill-icons/angularmaterial-original.svg'
            },
            {
                name: 'Bootstrap',
                icon: 'assets/skill-icons/bootstrap-original.svg'
            }
        ]
    },
    {
        id: 'cloud-devops',
        title: 'Cloud & DevOps',
        icon: 'cloud',
        theme: 'primary',
        skills: [
            {
                name: 'AWS S3',
                icon: 'assets/skill-icons/amazonwebservices-original-wordmark.svg'
            },
            {
                name: 'Cloudflare Pages',
                icon: 'assets/skill-icons/cloudflare-original.svg'
            },
            {
                name: 'Vercel',
                icon: 'assets/skill-icons/vercel-original.svg'
            },
            {
                name: 'Render',
                icon: ''
            },
            {
                name: 'InterServer VPS',
                icon: ''
            },
            {
                name: 'Nginx',
                icon: ''
            }
        ]
    },
    {
        id: 'tools-productivity',
        title: 'Tools & Productivity',
        icon: 'build',
        theme: 'secondary',
        skills: [
            {
                name: 'Git',
                icon: 'assets/skill-icons/git-original.svg'
            },
            {
                name: 'GitHub',
                icon: 'assets/skill-icons/github-original.svg'
            },
            {
                name: 'GitLab',
                icon: 'assets/skill-icons/gitlab-original.svg'
            },
            {
                name: 'Bitbucket',
                icon: 'assets/skill-icons/bitbucket-original.svg'
            },
            {
                name: 'VS Code',
                icon: 'assets/skill-icons/vscode-original.svg'
            },
            {
                name: 'Cursor',
                icon: ''
            },
            {
                name: 'Trae',
                icon: ''
            },
            {
                name: 'Antigravity',
                icon: ''
            },
            {
                name: 'Azure',
                icon: 'assets/skill-icons/azure-original.svg'
            }
        ]
    }
];
