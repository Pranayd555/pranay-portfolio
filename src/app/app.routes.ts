import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout.component';
import { reducers as skillsReducers } from './features/home/sections/skills/store/reducers';
import { reducers as projectsReducers } from './features/home/sections/projects/store/reducers';
import { provideState } from '@ngrx/store';
import { SkillsEffects } from './features/home/sections/skills/store/effects';
import { ProjectsEffects } from './features/home/sections/projects/store/effects';
import { provideEffects } from '@ngrx/effects';

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
                    provideEffects(SkillsEffects, ProjectsEffects),
                ]
            }
        ]
    },
    {
        path: '**',
        redirectTo: ''
    }
];
