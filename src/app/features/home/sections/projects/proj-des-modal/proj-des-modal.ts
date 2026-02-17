import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, Inject, signal, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { IProjectDetailsState } from '../types/projectDetailsState.model';
import * as ProjectDetailsActions from './store/actions';
import { toSignal } from '@angular/core/rxjs-interop';
import * as ProjectDetailsSelectors from './store/selectors';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-proj-des-modal',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  private platformId = inject(PLATFORM_ID);
  isBrowser = signal(isPlatformBrowser(this.platformId));


  sanitizedDemoUrl = computed(() => {
    const project = this.project();
    if (!project || !project.demoVideo) return null;

    const videoId = project.demoVideo;

    // Security: Validate videoId format (alphanumeric, hyphens, underscores, 11 chars)
    const youtubeIdRegex = /^[a-zA-Z0-9_-]{11}$/;
    if (videoId && youtubeIdRegex.test(videoId)) {
      // Use youtube-nocookie.com for privacy (doesn't set tracking cookies)
      // Parameters: rel=0 (no related videos), modestbranding=1 (no logo), iv_load_policy=3 (no annotations)
      const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    } else if (videoId) {
      console.warn(`[Security] Invalid YouTube Video ID detected: ${videoId}`);
    }

    return null;
  });

  constructor(
    private dialogRef: DialogRef<ProjDesModal>,
    private sanitizer: DomSanitizer,
    @Inject(DIALOG_DATA) public data: { projectId: string, rect: DOMRect }
  ) { }

  ngOnInit() {
    this.store.dispatch(ProjectDetailsActions.getProjectById({ projectId: this.data.projectId }));
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

    // Use requestAnimationFrame to ensure the modal is rendered and positioned
    requestAnimationFrame(() => {
      const modalRect = modalEl.getBoundingClientRect();

      // Set transform origin to top-left to match our coordinate calculations
      modalEl.style.transformOrigin = '0 0';

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
            opacity: 0,
          },
          {
            transform: 'none',
            opacity: 1,
          },
        ],
        {
          duration: 500,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'both',
        }
      );
    });
  }

  close() {
    const modalEl = this.modal.nativeElement;
    const { rect } = this.data;
    const modalRect = modalEl.getBoundingClientRect();

    modalEl.style.transformOrigin = '0 0';

    const scaleX = rect.width / modalRect.width;
    const scaleY = rect.height / modalRect.height;
    const translateX = rect.left - modalRect.left;
    const translateY = rect.top - modalRect.top;

    const animation = modalEl.animate(
      [
        { transform: 'none', opacity: 1 },
        {
          transform: `
            translate(${translateX}px, ${translateY}px)
            scale(${scaleX}, ${scaleY})
            rotateX(-10deg)
          `,
          opacity: 0,
        },
      ],
      {
        duration: 400,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'both',
      }
    );

    animation.onfinish = () => {
      this.dialogRef.close();
    };
  }

}
