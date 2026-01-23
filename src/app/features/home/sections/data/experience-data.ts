import { IExperience } from "../experience/types/experience.model";

export const experienceData: IExperience[] = [
    {
        id: 'unified-infotech',
        role: 'Associate / Senior Software Engineer',
        company: 'Unified Infotech',
        location: 'Remote',
        period: {
            start: 'Jun 2024',
            end: 'Present'
        },
        projects: [
            {
                name: 'Boards and Beyond',
                client: 'McGraw Hill',
                responsibilities: [
                    'Developed and optimized Angular (12–13) applications across Admin, Institution, and Learners portals',
                    'Implemented accessibility features and integrated Pendo analytics',
                    'Migrated CKEditor 4 to CKEditor 5 with a custom AWS S3-based file manager'
                ]
            },
            {
                name: 'CQFluency',
                responsibilities: [
                    'Stabilized enterprise UIs and workflows across multiple roles',
                    'Implemented RBAC, impersonation flows, and permission-based UI control',
                    'Resolved critical production issues across authentication, pricing, and file management'
                ]
            }
        ],
        highlights: [
            'Enterprise Angular development and migrations',
            'Advanced CKEditor customization with AWS S3',
            'Strong ownership of production stability'
        ]
    },

    {
        id: 'itc-infotech',
        role: 'Associate IT Consultant',
        company: 'ITC Infotech',
        location: 'Remote',
        period: {
            start: 'Mar 2022',
            end: 'Mar 2024'
        },
        projects: [
            {
                name: 'Mondee Inc',
                client: 'USA',
                responsibilities: [
                    'Worked on core hotel booking and search modules',
                    'Integrated Google Places API and advanced search features',
                    'Implemented Angular security patterns and i18n support'
                ]
            }
        ],
        highlights: [
            'Experience building global, customer-facing platforms'
        ]
    },

    {
        id: 'tcs',
        role: 'Systems Engineer',
        company: 'Tata Consultancy Services',
        location: 'Kolkata',
        period: {
            start: 'Mar 2018',
            end: 'Mar 2022'
        },
        projects: [
            {
                name: 'Old Mutual SA',
                responsibilities: [
                    'Developed and maintained scalable Angular applications',
                    'Migrated applications from Angular 4 to Angular 8',
                    'Built reusable components and shared services'
                ]
            },
            {
                name: 'CITI Bank Singapore',
                responsibilities: [
                    'Migrated legacy JavaScript and XML modules to Angular',
                    'Designed core modules and supported team delivery'
                ]
            }
        ],
        highlights: [
            'Strong foundation in legacy-to-modern Angular migrations'
        ]
    }
];
