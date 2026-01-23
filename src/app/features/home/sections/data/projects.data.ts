import { IProject } from "../projects/types/projects.model";

export const projectsData: IProject[] = [
    {
        "id": "presmistique",
        "title": "Resume Builder",
        "description": "AI-powered resume builder featuring Google Gemini 2.5 Flash integration for intelligent resume parsing, keyword enhancement, and ATS scoring.",
        "icon": "auto_awesome",
        "technologies": ["React", "Node.js", "Gemini AI", "Tailwind CSS", "Redux", "Cloudflare Pages", "InterServer VPS", "Nginx"],
        "featured": true,
        "links": {
            "liveDemo": "https://presmistique.in",
            "sourceCode": "https://github.com/Pranayd555/Resume-Builder"
        }
    },
    {
        "id": "ckeditor-plugin",
        "title": "CKEditor 5 Custom Plugin",
        "description": "Custom CKEditor 5 build with proprietary file upload adapter integrating AWS S3 and Cloudflare R2 for enterprise-grade asset management.",
        "icon": "extension",
        "technologies": ["CKEditor 5", "AWS S3", "Cloudflare R2", "TypeScript", "Webpack"],
        "links": {
            "sourceCode": "https://github.com/Pranayd555/ckEditor5"
        }
    },
    {
        "id": "fruit-basket",
        "title": "Fruit Basket",
        "description": "Full-stack e-commerce simulation with NgRx state management, custom directives, and reactive forms.",
        "icon": "shopping_basket",
        "technologies": ["Angular", "NgRx", "Node.js", "MongoDB"],
        "links": {
            "sourceCode": "https://github.com/Pranayd555/ZeRo"
        }
    }
]
