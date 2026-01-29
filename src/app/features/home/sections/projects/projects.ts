import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IProject } from './types/projects.model';
import { Store } from '@ngrx/store';
import { IProjectsState } from './types/projectsState.model';
import { toSignal } from '@angular/core/rxjs-interop';
import * as ProjectsSelectors from './store/selectors';
import * as ProjectsActions from './store/actions';
import { WaveTextComponent } from "../../../../shared/components/text-animations/wave-text";
import { Dialog } from '@angular/cdk/dialog';
import { ProjDesModal } from './proj-des-modal/proj-des-modal';

@Component({
  selector: 'app-projects',
  imports: [CommonModule, WaveTextComponent],
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

  constructor(private dialog: Dialog) { }

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
}
