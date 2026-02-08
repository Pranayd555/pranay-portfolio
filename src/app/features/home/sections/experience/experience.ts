import { ChangeDetectionStrategy, Component, computed, effect, HostListener, Inject, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { IExperience } from './types/experience.model';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import * as ExperienceSelectors from './store/selectors';
import { getExperience } from './store/actions';

@Component({
  selector: 'app-experience',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './experience.html',
  styleUrl: './experience.css',
})
export class Experience implements OnInit {

  private store = inject(Store<{ experience: IExperience[] }>);

  private isCardClicked = signal(false);
  cardClickedValue = computed(() => this.isCardClicked());
  animationActivated = signal<string | null>(null);

  public isLoading = toSignal(this.store.select(ExperienceSelectors.experienceIsLoadingSelector), {
    initialValue: true
  });

  public hasError = toSignal(this.store.select(ExperienceSelectors.experienceHasErrorSelector), {
    initialValue: false
  })

  public errorMessage = toSignal(this.store.select(ExperienceSelectors.experienceErrorMessageSelector), {
    initialValue: ''
  })

  public experiences = toSignal(this.store.select(ExperienceSelectors.experienceSelector), {
    initialValue: []
  })

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    effect(() => {
      const exps = this.experiences()
      if (exps.length > 0) {
        this.cardAnimation = 'card-enter';
      }
    })
  }



  ngOnInit(): void {
    this.store.dispatch(getExperience());
  }

  set cardAnimation(value: string | null) {
    this.animationActivated.set(value);
    const t = setTimeout(() => {
      clearTimeout(t);
      this.animationActivated.set('');
    }, 500);
  }

  getAnimationClass(idx: number, isDateClicked: boolean = false): string {
    let animationClass: string = '';
    let isEven = (idx % 2 === 0);
    if (isDateClicked) isEven = !isEven;
    if (this.isCardClicked()) {
      isEven ? animationClass = 'card-exit' : animationClass = 'card-enter';
    } else {
      isEven ? animationClass = 'card-enter' : animationClass = 'card-exit';
    }
    return animationClass;
  }


  retryLoad(): void {
    this.store.dispatch(getExperience())
  }

  // Helper method to format period display
  formatPeriod(period: { start: string; end: string }): string {
    return `${period.start} - ${period.end}`;
  }

  getContentOrder(idx: number): string {
    if (this.isCardClicked()) {
      return idx % 2 === 0 ? `md:order-3 md:pl-12` : `md:order-1 md:pr-12 md:text-right`;
    }
    return idx % 2 === 0 ? `md:order-1 md:pr-12 md:text-right` : `md:order-3 md:pl-12`;
  }

  getDateOrder(idx: number): string {
    if (this.isCardClicked()) {
      return idx % 2 === 0 ? 'md:order-1 md:pr-12 md:text-right' : 'md:order-3 md:pl-12';
    }
    return idx % 2 === 0 ? 'md:order-3 md:pl-12' : 'md:order-1 md:pr-12 md:text-right';
  }

  cardClicked(idx: number, isDateClicked: boolean = false) {
    if (this.animationActivated()) return;
    this.isCardClicked.set(!this.isCardClicked());
    this.cardAnimation = this.getAnimationClass(idx, isDateClicked);
  }
}
