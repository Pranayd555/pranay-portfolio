import { ISkillCategory } from "./types/skills.model";

export const skillsData: ISkillCategory[] = [
    {
        "id": "core-technologies",
        "title": "Core Technologies",
        "icon": "code",
        "theme": "primary",
        "skills": [
            { "name": "Angular" },
            { "name": "TypeScript" },
            { "name": "JavaScript (ES6+)" },
            { "name": "Node.js" },
            { "name": "RxJS & NgRx" },
            { "name": "MongoDB" },
            { "name": "Tailwind CSS" }
        ]
    },
    {
        "id": "devops-tools",
        "title": "DevOps & Tools",
        "icon": "settings",
        "theme": "secondary",
        "skills": [
            { "name": "Git" },
            { "name": "AWS (S3, EC2)" },
            { "name": "Cloudflare" },
            { "name": "Bitbucket" },
            { "name": "Cursor AI" }
        ]
    }
]
