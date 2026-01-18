import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IProject } from './types/projects.model';
import { Store } from '@ngrx/store';
import { IProjectsState } from './types/projectsState.model';
import { toSignal } from '@angular/core/rxjs-interop';
import * as ProjectsSelectors from './store/selectors';
import * as ProjectsActions from './store/actions';

@Component({
  selector: 'app-projects',
  imports: [CommonModule],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects implements OnInit {

  private store = inject(Store<{ projects: IProjectsState }>);

  isLoading = toSignal(this.store.select(ProjectsSelectors.isProjectsIsLoadingSelector), {
    initialValue: true
  })

  hasError = toSignal(this.store.select(ProjectsSelectors.isProjectsHasErrorSelector), {
    initialValue: false
  })

  errorMessage = toSignal(this.store.select(ProjectsSelectors.getProjectsErrorMessageSelector), {
    initialValue: ''
  })

  projects = toSignal(this.store.select(ProjectsSelectors.getProjectsSelector), {
    initialValue: []
  })

  constructor() { }

  ngOnInit(): void {
    this.store.dispatch(ProjectsActions.getProjects());
  }

  retryLoad(): void {
    this.store.dispatch(ProjectsActions.getProjects());
  }
}
