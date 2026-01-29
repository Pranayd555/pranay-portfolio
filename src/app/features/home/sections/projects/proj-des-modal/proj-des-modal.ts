import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, ElementRef, inject, Inject, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { IProjectDetailsState } from '../types/projectDetailsState.model';
import * as ProjectDetailsActions from './store/actions';
import { toSignal } from '@angular/core/rxjs-interop';
import * as ProjectDetailsSelectors from './store/selectors';

@Component({
  selector: 'app-proj-des-modal',
  imports: [],
  templateUrl: './proj-des-modal.html',
  styleUrl: './proj-des-modal.css',
})
export class ProjDesModal {

  @ViewChild('modal') modal!: ElementRef;
  private store = inject(Store<{ projectDetails: IProjectDetailsState }>)

  isLoading = toSignal(this.store.select(ProjectDetailsSelectors.selectProjectDetailsIsLoading), {
    initialValue: true
  })

  hasError = toSignal(this.store.select(ProjectDetailsSelectors.selectProjectDetailsHasError), {
    initialValue: false
  })

  errorMessage = toSignal(this.store.select(ProjectDetailsSelectors.selectProjectDetailsErrorMessage), {
    initialValue: ''
  })

  project = toSignal(this.store.select(ProjectDetailsSelectors.selectProjectDetails), {
    initialValue: null
  })

  constructor(
    private dialogRef: DialogRef<ProjDesModal>,
    @Inject(DIALOG_DATA) public data: { projectId: string, rect: DOMRect }
  ) { }

  ngOnInit() {
    this.store.dispatch(ProjectDetailsActions.getProjectById({ projectId: this.data.projectId }))
  }

  retryLoad() {
    this.store.dispatch(ProjectDetailsActions.getProjectById({ projectId: this.data.projectId }))
  }

  ngAfterViewInit() {
    this.animateIn();
  }

  animateIn() {
    const { rect } = this.data;
    const modalEl = this.modal.nativeElement;

    const modalRect = modalEl.getBoundingClientRect();

    const scaleX = rect.width / modalRect.width;
    const scaleY = rect.height / modalRect.height;
    const translateX = rect.left - modalRect.left;
    const translateY = rect.top - modalRect.top;

    modalEl.animate(
      [
        {
          transform: `
            translate(${translateX}px, ${translateY}px)
            scale(${scaleX}, ${scaleY})
            rotateX(15deg)
          `,
          opacity: 0.7,
        },
        {
          transform: 'none',
          opacity: 1,
        },
      ],
      {
        duration: 450,
        easing: 'cubic-bezier(.22,1,.36,1)',
        fill: 'both',
      }
    );
  }

  close() {
    const modalEl = this.modal.nativeElement;
    const modalRect = modalEl.getBoundingClientRect();
    const { rect } = this.data;

    const animation = modalEl.animate(
      [
        { transform: 'none', opacity: 1 },
        {
          transform: `
            translate(${rect.left - modalRect.left}px,
                      ${rect.top - modalRect.top}px)
            scale(${rect.width / modalRect.width},
                  ${rect.height / modalRect.height})
            rotateX(-10deg)
          `,
          opacity: 0,
        },
      ],
      {
        duration: 350,
        easing: 'ease-in',
        fill: 'both',
      }
    );

    animation.onfinish = () => {
      this.dialogRef.close();
    };
  }

}
