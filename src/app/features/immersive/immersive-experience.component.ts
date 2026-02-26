import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { ScrollNavigationService } from '../../core/services/scroll-navigation.service';
import { HeroSlideComponent } from './slides/hero-slide/hero-slide.component';
import { AboutSlideComponent } from './slides/about-slide/about-slide.component';
import { ProjectsSlideComponent } from './slides/projects-slide/projects-slide.component';
import { ExperienceSlideComponent } from './slides/experience-slide/experience-slide.component';
import { ContactSlideComponent } from './slides/contact-slide/contact-slide.component';
import { PlaygroundSlideComponent } from './slides/playground-slide/playground-slide';
import { HeroIconParticlesComponent } from '../../shared';

@Component({
  selector: 'app-immersive-experience',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeroSlideComponent,
    AboutSlideComponent,
    ProjectsSlideComponent,
    ExperienceSlideComponent,
    ContactSlideComponent,
    PlaygroundSlideComponent,
    HeroIconParticlesComponent,
  ],
  template: `
    <div class="fixed inset-0 w-dvw h-dvh overflow-hidden bg-background-dark text-white">

      <!-- Persistent mouse-reactive particle background (behavior switches per slide) -->
      <!-- <app-immersive-particle [slideIndex]="currentSlide()" /> -->

      <!-- Slide overlays: only the active slide is shown, fades in with CSS animation -->
      <div class="absolute inset-0">

        @if (currentSlide() === 0) {
          <app-hero-slide class="animate-slide-up" ><app-hero-icon-particles /></app-hero-slide>
        }
        @if (currentSlide() === 1) {
          <app-about-slide class="animate-slide-up" ><app-hero-icon-particles /></app-about-slide>
        }
        @if (currentSlide() === 2) {
          <app-projects-slide class="animate-slide-up" ><app-hero-icon-particles /></app-projects-slide>
        }
        @if (currentSlide() === 3) {
          <app-experience-slide class="animate-slide-up" ><app-hero-icon-particles /></app-experience-slide>
        }
        @if (currentSlide() === 4) {
          <app-contact-slide class="animate-slide-up" ><app-hero-icon-particles /></app-contact-slide>
        }
        @if (currentSlide() === 5) {
          <app-playground-slide class="animate-slide-up" ><app-hero-icon-particles /></app-playground-slide>
        }

      </div>

      <!-- Left arrow -->
      <button
        class="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 z-20
               w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center
               text-white/40 hover:text-white/90 transition-colors duration-300
               disabled:opacity-20 disabled:cursor-not-allowed"
        [disabled]="currentSlide() === 0"
        (click)="navService.prev()"
        aria-label="Previous slide"
      >
        <svg class="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>

      <!-- Right arrow -->
      <button
        class="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 z-20
               w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center
               text-white/40 hover:text-white/90 transition-colors duration-300
               disabled:opacity-20 disabled:cursor-not-allowed"
        [disabled]="currentSlide() === navService.TOTAL_SLIDES - 1"
        (click)="navService.next()"
        aria-label="Next slide"
      >
        <svg class="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>

      <!-- Slide indicators (dots) -->
      <div class="absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2 sm:gap-3">
        @for (slide of navService.slides; track slide.id; let i = $index) {
          <button
            class="transition-all duration-400 rounded-full"
            [class]="i === currentSlide()
              ? 'w-6 h-1.5 bg-white'
              : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'"
            (click)="navService.goTo(i)"
            [attr.aria-label]="'Go to ' + slide.title"
          ></button>
        }
      </div>

      <!-- Slide title indicator (top-left, like particle-love) -->
      <div class="absolute top-[calc(1rem+env(safe-area-inset-top))] sm:top-6 left-4 sm:left-6 z-20">
        <p class="text-white/20 text-xs tracking-[0.4em] uppercase font-light">
          {{ currentSlideConfig().subtitle }}
        </p>
      </div>

    </div>
  `,
})
export class ImmersiveExperienceComponent implements OnInit, OnDestroy {
  readonly navService = inject(ScrollNavigationService);
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private el = inject(ElementRef);

  currentSlide = this.navService.currentSlide;

  currentSlideConfig = () => this.navService.slides[this.currentSlide()];

  // Touch tracking
  private touchStartY = 0;
  private touchStartX = 0;

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    if (e.deltaY > 0) this.navService.next();
    else this.navService.prev();
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      this.navService.next();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      this.navService.prev();
    }
  };

  private onTouchStart = (e: TouchEvent): void => {
    this.touchStartY = e.touches[0].clientY;
    this.touchStartX = e.touches[0].clientX;
  };

  private onTouchEnd = (e: TouchEvent): void => {
    const dy = this.touchStartY - e.changedTouches[0].clientY;
    const dx = this.touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 50) {
      if (dy > 0) this.navService.next();
      else this.navService.prev();
    }
  };

  ngOnInit(): void {
    this.navService.resetToFirst();

    if (isPlatformBrowser(this.platformId)) {
      this.el.nativeElement.addEventListener('wheel', this.onWheel, { passive: false });
      this.document.addEventListener('keydown', this.onKeyDown);
      this.el.nativeElement.addEventListener('touchstart', this.onTouchStart, { passive: true });
      this.el.nativeElement.addEventListener('touchend', this.onTouchEnd, { passive: true });
    }

    this.destroyRef.onDestroy(() => this.removeEvents());
  }

  ngOnDestroy(): void {}

  private removeEvents(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.el.nativeElement.removeEventListener('wheel', this.onWheel);
      this.document.removeEventListener('keydown', this.onKeyDown);
      this.el.nativeElement.removeEventListener('touchstart', this.onTouchStart);
      this.el.nativeElement.removeEventListener('touchend', this.onTouchEnd);
    }
  }
}
