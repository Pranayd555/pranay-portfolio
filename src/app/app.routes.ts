import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout.component';
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
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
                providers: [
                    provideState('skills', skillsReducers),
                    provideState('projects', projectsReducers),
                    provideState('experience', experienceReducers),
                    provideState('education', educationReducers),
                    provideState('projectDetails', projectDetailsReducers),
                    provideEffects(SkillsEffects, ProjectsEffects, ExperienceEffects, EducationEffects, ProjectDetailsEffects),
                ]
            }
        ]
    },
    {
        path: '**',
        redirectTo: ''
    }
];
