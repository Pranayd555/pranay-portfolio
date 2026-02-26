import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout.component';
import { ImmersiveLayoutComponent } from './layouts/immersive-layout/immersive-layout.component';
import { reducers as skillsReducers } from './features/home/sections/skills/store/reducers';
import { reducers as projectsReducers } from './features/home/sections/projects/store/reducers';
import { reducers as experienceReducers } from './features/home/sections/experience/store/reducers';
import { reducers as educationReducers } from './features/home/sections/education/store/reducers';
import { reducers as projectDetailsReducers } from './features/home/sections/projects/proj-des-modal/store/reducers';
import { provideState } from '@ngrx/store';
import { SkillsEffects } from './features/home/sections/skills/store/effects';
import { ProjectsEffects } from './features/home/sections/projects/store/effects';
import { provideEffects } from '@ngrx/effects';
import { ExperienceEffects } from './features/home/sections/experience/store/effects';
import { EducationEffects } from './features/home/sections/education/store/effects';
import { ProjectDetailsEffects } from './features/home/sections/projects/proj-des-modal/store/effects';

export const routes: Routes = [
  // Immersive landing experience (no header/footer)
  {
    path: '',
    component: ImmersiveLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/immersive/immersive-experience.component').then(
            m => m.ImmersiveExperienceComponent
          ),
      },
    ],
  },

  // Detail pages (with header/footer via MainLayoutComponent)
  {
    path: 'about',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/about/about.component').then(m => m.AboutComponent),
        providers: [
          provideState('skills', skillsReducers),
          provideEffects(SkillsEffects),
        ],
      },
    ],
  },
  {
    path: 'projects',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/projects-page/projects-page.component').then(
            m => m.ProjectsPageComponent
          ),
        providers: [
          provideState('projects', projectsReducers),
          provideState('projectDetails', projectDetailsReducers),
          provideEffects(ProjectsEffects, ProjectDetailsEffects),
        ],
      },
    ],
  },
  {
    path: 'experience',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/experience-page/experience-page.component').then(
            m => m.ExperiencePageComponent
          ),
        providers: [
          provideState('experience', experienceReducers),
          provideState('education', educationReducers),
          provideEffects(ExperienceEffects, EducationEffects),
        ],
      },
    ],
  },
  {
    path: 'contact',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/contact-page/contact-page.component').then(
            m => m.ContactPageComponent
          ),
      },
    ],
  },

  {
    path: '**',
    redirectTo: '',
  },
];
