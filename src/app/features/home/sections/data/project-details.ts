import { IProjectDetails } from "../projects/types/projectDetails.model";

export const projectDetailsData: IProjectDetails[] = [
    {
        id: 'presmistique',
        title: 'Presmistique – Resume Builder Platform',
        shortDescription:
            'A full-stack AI-powered resume builder and optimizer with ATS scoring and resume parsing.',

        overview:
            'Presmistique is a full-stack web application that allows users to create, parse, and optimize resumes using modern templates and AI-driven analysis. It supports resume generation, ATS scoring, keyword optimization, and PDF exports.',

        whyBuilt:
            'Most resume builders lack ATS intelligence and real-world optimization insights. This project was built to help job seekers create resumes that are both visually appealing and ATS-compliant using AI.',

        problemsSolved: [
            'Lack of ATS-friendly resume analysis',
            'Manual resume optimization and keyword tuning',
            'Poor resume parsing accuracy',
            'Fragmented deployment and scalability issues'
        ],

        keyFeatures: [
            'AI-powered resume parsing and enhancement',
            'ATS score analysis with actionable suggestions',
            'Template-driven resume generation',
            'PDF generation using Puppeteer & Chromium',
            'End-to-end CI/CD pipeline with production monitoring'
        ],

        showcasedSkills: [
            'Full-stack architecture design',
            'AI integration (Google Gemini)',
            'REST API design',
            'Cloud deployment & CI/CD',
            'Performance optimization'
        ],

        bottlenecksFaced: [
            'Parsing inconsistent resume formats',
            'Generating pixel-perfect PDFs',
            'Managing production deployments across multiple services'
        ],

        howTheyWereSolved: [
            'Used Gemini 2.5 Flash for contextual parsing and enhancement',
            'Implemented Puppeteer with headless Chromium',
            'Designed CI/CD pipelines with Cloudflare Pages, Vercel, and VPS'
        ],

        demoGif: '',
        liveUrl: 'https://presmistique.in',

        technologies: [
            'React',
            'JavaScript (ES6+)',
            'Node.js',
            'Express.js',
            'MongoDB',
            'Tailwind CSS',
            'Google Gemini 2.5 Flash',
            'Puppeteer',
            'Cloudflare Pages',
            'Vercel',
            'Render',
            'Linux',
            'Nginx'
        ]
    },

    {
        id: 'ckeditor-plugin',
        title: 'CKEditor 5 – Custom File Manager Plugin',
        shortDescription:
            'A custom CKEditor 5 build with in-house file manager integrated with AWS S3 and Cloudflare R2.',

        overview:
            'This project is a fully customized CKEditor 5 build featuring a proprietary file manager plugin that allows direct uploads, asset browsing, and management without relying on paid third-party services.',

        whyBuilt:
            'Enterprise editors often rely on expensive tools like CKFinder or CKBox. This solution was built to eliminate licensing costs while retaining full control over file management.',

        problemsSolved: [
            'High licensing cost of CKFinder / CKBox',
            'Limited customization of third-party file managers',
            'Inefficient asset handling in rich-text editors'
        ],

        keyFeatures: [
            'Custom CKEditor 5 build',
            'Direct AWS S3 and Cloudflare R2 integration',
            'In-house file upload and asset management',
            'Optimized Webpack bundling'
        ],

        showcasedSkills: [
            'Custom plugin architecture',
            'Webpack optimization',
            'Cloud storage integration',
            'Advanced JavaScript'
        ],

        bottlenecksFaced: [
            'CKEditor 5 build complexity',
            'Managing secure file uploads',
            'Optimizing bundle size'
        ],

        howTheyWereSolved: [
            'Deep R&D on CKEditor plugin APIs',
            'Implemented signed uploads for S3/R2',
            'Custom Webpack configuration'
        ],

        demoGif: '/assets/projects-demo/ckeditor_demo.gif',
        repoUrl: 'https://github.com/Pranayd555/ckEditor5',

        technologies: [
            'JavaScript',
            'CKEditor 5',
            'Webpack',
            'Tailwind CSS',
            'Amazon S3',
            'Cloudflare R2'
        ]
    },

    {
        id: 'fruit-basket',
        title: 'Fruit Basket – E-commerce Demo',
        shortDescription:
            'A responsive frontend demo showcasing cart logic, pricing, and UI state management.',

        overview:
            'Fruit Basket is a lightweight e-commerce demo application focusing on frontend architecture, cart state management, and responsive UI design.',

        whyBuilt:
            'Built as a demonstration of clean frontend architecture, reusable components, and state management concepts.',

        problemsSolved: [
            'Managing cart state efficiently',
            'Ensuring responsive UI across devices',
            'Maintaining clean component separation'
        ],

        keyFeatures: [
            'Dynamic cart and pricing logic',
            'Reusable UI components',
            'Responsive grid layout',
            'State-driven UI updates'
        ],

        showcasedSkills: [
            'Component architecture',
            'State management',
            'Responsive design',
            'Frontend best practices'
        ],

        bottlenecksFaced: [
            'Avoiding prop drilling',
            'Maintaining UI consistency'
        ],

        howTheyWereSolved: [
            'Centralized state management',
            'Reusable layout components'
        ],

        demoGif: '/assets/projects-demo/fruit-basket_demo.gif',

        technologies: [
            'Angular',
            'TypeScript',
            'CSS',
            'Responsive Design'
        ]
    }
];
