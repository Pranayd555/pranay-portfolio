import { IProjectDetails } from "../projects/types/projectDetails.model";

export const projectDetailsData: IProjectDetails[] = [
    {
        id: 'eva-ai',
        title: 'EVA AI – Personal Portfolio Chatbot',
        shortDescription:
            'A grounded, real-time AI assistant (Eva) embedded in my Angular portfolio with Gemini Live, WebSockets, and off-thread chat caching.',

        overview: `
        EVA AI is a full-stack conversational layer on top of my personal portfolio. Visitors ask questions about my experience, projects, and skills; Eva answers only from a curated markdown knowledge base via function calling — never from general world knowledge. The Angular 21 frontend streams token-by-token responses over WebSockets, caches conversations in a Web Worker + IndexedDB, and runs alongside immersive Three.js visuals without blocking the main thread.
        `.trim(),

        whyBuilt: `
        Static portfolios force visitors to hunt for the one detail they care about. I built Eva so recruiters, founders, and developers could ask directly — and get accurate, portfolio-grounded answers at 2 AM when no one is online. The same pattern applies to any product that must guide users by company policy, not generic LLM knowledge.
        `.trim(),

        problemsSolved: [
            'Eliminated AI hallucination on personal data via strict tool-gated retrieval',
            'Delivered ChatGPT-style streaming UX with Gemini Live over WebSockets',
            'Kept chat UI responsive under high-frequency updates using Angular Signals + zoneless CD',
            'Persisted session history off the main thread with Web Workers and IndexedDB',
            'Deployed a reproducible backend on Docker + Nginx behind Cloudflare',
        ],

        keyFeatures: [
            'searchKnowledge function calling with chunked markdown sources',
            'Gemini Live bidirectional sessions with TEXT_CHUNK streaming',
            'Angular chat console (EVA.exe) with reconnect and reset flows',
            'RxJS webSocket client with retry and session persistence',
            'Multi-stage Docker image with explicit knowledge file copy',
        ],

        showcasedSkills: [
            'AI agent design & prompt engineering',
            'Real-time WebSocket architecture',
            'Angular 21 signals & performance',
            'Web Workers & browser storage',
            'Containerized VPS deployment',
        ],

        bottlenecksFaced: [
            'POST-based chat felt slow — users waited for full responses',
            'Dumping entire knowledge base into context ballooned latency and token cost',
            'IndexedDB writes on the main thread caused scroll jank during streaming',
            'Markdown knowledge files not copied into Docker runtime image by default',
        ],

        howTheyWereSolved: [
            'Upgraded to Gemini Live with persistent WebSocket sessions and progressive TEXT_CHUNK delivery',
            'Split knowledge into domain-specific files with an enum-gated searchKnowledge tool',
            'Moved cache read/write to a dedicated module Web Worker (TabCacheDB)',
            'Explicit COPY of src/knowledge in Dockerfile; Nginx WebSocket upgrade headers with extended timeouts',
        ],

        demoGif: '',
        liveUrl: 'https://pranay.presmistique.in',

        technologies: [
            'Angular 21',
            'TypeScript',
            'NgRx',
            'Three.js',
            'Node.js 22',
            'Express',
            'Gemini Live API',
            'WebSockets',
            'Web Workers',
            'IndexedDB',
            'Docker',
            'Nginx',
            'Cloudflare Pages',
        ]
    },

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
        demoVideo: 'QkUQtSjI6DE',

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
        id: 'codelens-graph',
        title: 'CodeLens Graph — AI Codebase Knowledge Graph',
        shortDescription: 'A VS Code extension that indexes source code into a graph and exposes MCP tools for safe AI-assisted reasoning.',

        overview: `
        CodeLens Graph builds an indexed knowledge graph of a codebase and exposes it through a Model Context Protocol toolset. It uses Tree-sitter for AST parsing, sql.js for compact graph persistence, and MCP to let AI assistants query only the symbols and references they need.
        `.trim(),

        whyBuilt: `
        The goal was to avoid asking an LLM to read full source files. Instead, the extension enables agents to perform safe, deterministic queries against a code graph and reduces hallucination risk by keeping the tool output small and precise.
        `.trim(),

        problemsSolved: [
            'Reduced LLM token cost by providing graph-driven query tools instead of raw file dumps',
            'Created reliable symbol extraction using Tree-sitter WASM, with a regex fallback for unsupported languages',
            'Persisted workspace graph state in a cross-platform SQLite WASM database',
            'Offered an MCP interface so AI assistants can triage, search, and inspect code safely',
        ],

        keyFeatures: [
            'Language-aware AST parsing with Tree-sitter and fallback parsing rules',
            'Graph storage of nodes, edges, and call references using `sql.js`',
            'Model Context Protocol tools like `codelens_triage`, `codelens_search`, and `codelens_context`',
            'Skill generation for agents to keep tool usage aligned with the graph',
        ],

        showcasedSkills: [
            'Code analysis architecture',
            'MCP / tool-based AI integration',
            'WASM-based persistence and parsing',
            'Graph data modeling',
            'VS Code extension design',
        ],

        bottlenecksFaced: [
            'Tree-sitter WASM grammars increase bundle complexity and require careful loading',
            'sql.js stores the graph in memory, which can grow for large repositories',
            'Balancing precise tool outputs with enough context for agents to make decisions',
        ],

        howTheyWereSolved: [
            'Added a regex fallback parser for unsupported languages',
            'Kept the graph schema compact and focused on essential metadata',
            'Used a triage tool to force the agent to select the smallest next step',
        ],

        demoGif: '',
        liveUrl: '',
        repoUrl: 'https://github.com/Pranayd555/codelens-graph',

        technologies: [
            'TypeScript',
            'Tree-sitter',
            'sql.js',
            'MCP',
            'VS Code',
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
