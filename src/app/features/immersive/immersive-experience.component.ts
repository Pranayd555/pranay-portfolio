import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { Router, Event, NavigationStart, NavigationEnd } from '@angular/router';
import { ScrollNavigationService } from '../../core/services/scroll-navigation.service';
import { HeroSlideComponent } from './slides/hero-slide/hero-slide.component';
import { AboutSlideComponent } from './slides/about-slide/about-slide.component';
import { ProjectsSlideComponent } from './slides/projects-slide/projects-slide.component';
import { ExperienceSlideComponent } from './slides/experience-slide/experience-slide.component';
import { ContactSlideComponent } from './slides/contact-slide/contact-slide.component';
import { PlaygroundSlideComponent } from './slides/playground-slide/playground-slide';
import { AboutParticleBgComponent, ConnectParticleBg, HeroIconParticlesComponent, SlideParticleBgComponent, WaveParticleBgComponent } from '../../shared';
import { TextScrapperAnimation } from '../../shared/components/text-scrapper-animation/text-scrapper-animation';

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
    AboutParticleBgComponent,
    ConnectParticleBg,
    SlideParticleBgComponent,
    WaveParticleBgComponent,
    TextScrapperAnimation,
],
  template: `
    <div class="fixed inset-0 w-dvw h-dvh overflow-hidden bg-background-dark text-white">

      <!-- Persistent mouse-reactive particle background (behavior switches per slide) -->
      <!-- <app-immersive-particle [slideIndex]="currentSlide()" /> -->

      <!-- Slide overlays: only the active slide is shown, fades in with CSS animation -->
      <div class="absolute inset-0">

        @if (currentSlide() === 0) {
          <app-hero-slide class="animate-slide-up" >
            <!-- <app-hero-icon-particles /> -->
          <app-text-scrapper-animation />
        </app-hero-slide>
        }
        @if (currentSlide() === 1) {
          <app-about-slide class="animate-slide-up" ><app-about-particle-bg /></app-about-slide>
        }
        @if (currentSlide() === 2) {
          <app-projects-slide class="animate-slide-up" ><app-slide-particle-bg /></app-projects-slide>
        }
        @if (currentSlide() === 3) {
          <app-experience-slide class="animate-slide-up" ><app-wave-particle-bg /></app-experience-slide>
        }
        @if (currentSlide() === 4) {
          <app-contact-slide class="animate-slide-up"><app-connect-particle-bg /></app-contact-slide>
        }
        @if (currentSlide() === 5) {
          <app-playground-slide class="animate-slide-up" ><app-hero-icon-particles /></app-playground-slide>
        }

      </div>

      <!-- Left arrow -->
      <button
        class="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 z-20
               w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center
               text-white/40 hover:text-white/90 transition-colors duration-300 cursor-pointer
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
               text-white/40 hover:text-white/90 transition-colors duration-300 cursor-pointer
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

      <!-- Floating resume download button -->
      <button
        type="button"
        class="fixed top-[calc(1rem+env(safe-area-inset-top))] sm:top-6 right-4 sm:right-6 z-20
               w-12 h-12 sm:w-14 sm:h-14 rounded-full
               flex items-center justify-center
               bg-white/10 backdrop-blur-md border border-white/20
               text-white hover:bg-white/20 hover:border-white/40
               shadow-lg hover:shadow-xl hover:scale-105
               transition-all duration-300 ease-out
               focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background-dark cursor-pointer"
        (click)="onResumeDownload()"
        aria-label="Download resume (Pranay_Das_resume)"
        title="Download resume"
      >
        <svg class="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </button>

    </div>
  `,
})
export class ImmersiveExperienceComponent implements OnInit, OnDestroy {
  readonly navService = inject(ScrollNavigationService);
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private el = inject(ElementRef);
  private router = inject(Router);

  readonly resumeUrl = '/assets/Pranay_Das_Resume.pdf';
  readonly resumeDownloadFilename = 'Pranay_Das_resume.pdf';

  currentSlide = this.navService.currentSlide;

  currentSlideConfig = () => this.navService.slides[this.currentSlide()];

  onResumeDownload(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const url = this.resumeUrl;
    window.open(url, '_blank', 'noopener,noreferrer');
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const a = this.document.createElement('a');
        a.href = objectUrl;
        a.download = this.resumeDownloadFilename;
        a.click();
        URL.revokeObjectURL(objectUrl);
      })
      .catch(() => {});
  }

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
    let lastTrigger: string | undefined;
    this.router.events
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((e: Event): e is NavigationStart => e instanceof NavigationStart)
      )
      .subscribe((e: NavigationStart) => {
        lastTrigger = e.navigationTrigger;
      });
    this.router.events
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((e: Event): e is NavigationEnd => e instanceof NavigationEnd),
        filter(() => this.router.url === '' || this.router.url === '/')
      )
      .subscribe(() => {
        if (lastTrigger !== 'popstate') {
          this.navService.resetToFirst();
        }
      });

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
