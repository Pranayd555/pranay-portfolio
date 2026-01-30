import { IProjectDetails } from "../projects/types/projectDetails.model";

export const projectDetailsData: IProjectDetails[] = [
    {
        id: 'presmistique',
        title: 'Presmistique – Resume Builder Platform',
        shortDescription:
            'A full-stack AI-powered resume builder and optimizer with ATS scoring and resume parsing.',

        overview: `
        Presmistique is a production-ready resume builder designed to help users craft professional resumes effortlessly using dynamic templates, AI features, and intuitive UI. It combines a clean front-end experience with a powerful backend engine that handles PDF exports, payments, refunds, authentication, and email automation. Built to support both mobile and web, it integrates real-world complexities like Razorpay payments, token-based logic, and OAuth authentication, delivering a complete SaaS-style experience.
        `.trim(),

        whyBuilt: `
        I built Presmistique to bridge the gap between template-driven resume tools and modern developer-oriented platforms. Most existing tools lacked flexibility, AI support, or transparency in billing. This project allowed me to build a real-world system from scratch that handles design, user data, secure payments, refunds, template rendering, CI/CD, and more — giving me end-to-end ownership of both the technical and product vision.
        `.trim(),

        problemsSolved: [
            "Offered a true pay-as-you-go pricing model — no mandatory monthly or yearly subscriptions",
            "Allowed complete control over resume formatting, including font styles, sizes, line spacing, section spacing, and color customization",
            "Introduced ATS (Applicant Tracking System) analysis by comparing uploaded resumes against job descriptions",
            "Enabled AI-powered enhancement recommendations based on ATS feedback to improve resume scoring",
            "Provided fully customizable templates — users can adapt or upload their own designs for personal branding",
            "Made the entire resume building experience free for users who don’t need AI-assisted features",
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
            "Render deployment failing due to unzip conflicts and Puppeteer setup",
            "OAuth flow breaking when environment variables were missing or misconfigured",
            "Razorpay refund logic needing to account for bonus tokens and edge cases",
            "CI/CD pipeline triggering unnecessary deploys on backend and frontend changes"
        ],

        howTheyWereSolved: [
            "Added custom build-test scripts and fixed Puppeteer Chromium path with environment flags on Render",
            "Deferred OAuth initialization unless valid client IDs are present; added fallback UI notices",
            "Built a 6-scenario refund engine with safe token deduction and Razorpay integration for fair refunds",
            "Implemented path-based smart detection in GitHub Actions to deploy only backend/frontend when relevant"
        ],

        demoGif: '',
        liveUrl: 'https://presmistique.in',
        demoVideo: 'https://youtu.be/QkUQtSjI6DE',

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

        overview: `
        This project is a fully customized build of CKEditor5 that restores and extends essential features like image upload, file browsing, and rich content formatting — many of which were available in CKEditor4 but moved behind paywalls in CKEditor5. It includes a custom file manager integrated with AWS S3, built as a JavaScript plugin and packaged via Webpack for seamless integration in Angular or any JavaScript project.
        `.trim(),

        whyBuilt: `
        While upgrading an Angular 14 project that used CKEditor4 with S3-based file management, I discovered CKEditor5 had deprecated many free features — pushing them into paid tools like CKFinder and CKBox. Since the existing system relied on AWS S3 for file storage, and CKEditor5 lacked both free file upload support and TypeScript plugins, I decided to build my own plugin system in JavaScript. This project became a reusable CKEditor5 build with all required functionality, ready for plug-and-play use across modern web apps.
        `.trim(),

        problemsSolved: [
            "Restored image upload and file management features in CKEditor5 using a free custom plugin",
            "Replaced expensive CKBox/CKFinder tools by integrating directly with AWS S3",
            "Enabled advanced formatting for resume and CMS use cases (fonts, alignment, tables)",
            "Overcame lack of TypeScript documentation by writing core plugins in JavaScript",
            "Packaged a reusable Webpack build that works in any JS or Angular 14+ project",
        ],

        keyFeatures: [
            "Custom S3-integrated file manager plugin for image and file uploads",
            "Modern toolbar with grouped formatting, media, and layout controls",
            "Support for font styles, alignment, headings, highlights, and tables",
            "Autosave, undo/redo stack, and source code editing mode",
            "Reusable CKEditor5 build bundled via Webpack for multi-app use",
        ],

        showcasedSkills: [
            "Plugin-based architecture configuration in CKEditor5",
            "Webpack-based custom build for JS libraries",
            "Editor toolbar design and accessibility handling",
            "UI/UX tuning for content editing interfaces",
            "Integration-ready output for Angular, React/Vue apps",
        ],

        bottlenecksFaced: [
            "Lack of TypeScript plugin documentation for CKEditor5",
            "Paid wall around essential features like file/image upload",
            "Bundling errors with CKEditor5 plugins and Angular integration"
        ],

        howTheyWereSolved: [
            "Wrote custom JavaScript plugin for file manager and image upload, then wrapped it for TypeScript projects",
            "Bypassed paid tools like CKBox by connecting directly to AWS S3 with custom backend endpoints",
            "Configured Webpack and build scripts to produce a portable, integration-ready CKEditor5 build",
        ],

        demoGif: '/assets/projects-demo/ckeditor_demo.gif',
        repoUrl: 'https://github.com/Pranayd555/ckEditor5',

        technologies: [
            "JavaScript",
            "CKEditor5",
            "Webpack",
            "ESBuild",
            "HTML",
            "CSS",
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
