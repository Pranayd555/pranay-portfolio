import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IProject } from './types/projects.model';
import { Store } from '@ngrx/store';
import { IProjectsState } from './types/projectsState.model';
import { toSignal } from '@angular/core/rxjs-interop';
import * as ProjectsSelectors from './store/selectors';
import * as ProjectsActions from './store/actions';
import { Dialog } from '@angular/cdk/dialog';
import { ProjDesModal } from './proj-des-modal/proj-des-modal';
import { Router } from '@angular/router';

@Component({
  selector: 'app-projects',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects implements OnInit {

  readonly store = inject(Store<{ projects: IProjectsState }>);
  readonly router = inject(Router);
  readonly dialog = inject(Dialog);

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

  ngOnInit(): void {
    this.store.dispatch(ProjectsActions.getProjects());
  }

  retryLoad(): void {
    this.store.dispatch(ProjectsActions.getProjects());
  }

  openModal(event: Event, project: IProject): void {
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.dialog.open(ProjDesModal, {
      data: { projectId: project.id, rect },
      // Optional: Add a custom panel class for further targeting
      panelClass: 'project-modal-panel',
      disableClose: true,
      hasBackdrop: true,
    });
  }

  routeToBlog(event: Event, project: IProject): void {
    event.stopPropagation();
    this.router.navigate(['/projects', project.id])
  }
}
