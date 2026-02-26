import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ScrollNavigationService } from '../../../../core/services/scroll-navigation.service';

@Component({
  selector: 'app-hero-slide',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="absolute inset-0 flex items-center justify-center select-none px-5 sm:px-10">
      <!-- Skill icon sprites (Three.js) -->
      <!-- <app-hero-icon-particles /> -->
       <ng-content></ng-content>

      <!-- Center overlay content -->
      <div class="relative z-10 flex flex-col items-center text-center w-full max-w-[46rem]">
        <p class="text-[0.65rem] sm:text-xs tracking-[0.45em] text-white/40 uppercase mb-5 sm:mb-6 font-light">
          01 / 06
        </p>

        <h1 class="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold
                   tracking-[0.12em] sm:tracking-[0.18em] md:tracking-[0.2em]
                   text-white uppercase leading-[0.9] mb-3 neon-text">
          PRANAY DAS
        </h1>

        <p class="text-[0.7rem] sm:text-sm text-white/50 tracking-[0.28em] sm:tracking-[0.35em] uppercase mb-8 sm:mb-10 font-light">
          Sr. Software Engineer
        </p>

        <!-- Diamond Explore button -->
        <button
          type="button"
          class="relative flex flex-col items-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 rounded-2xl"
          (click)="onEnter()"
          aria-label="Explore"
        >
          <span class="w-16 h-16 sm:w-20 sm:h-20 rotate-45 border border-white/30 bg-white/5
                       flex items-center justify-center cursor-pointer
                       hover:bg-white/15 hover:border-white/60 transition-all duration-300
                       hover:shadow-[0_0_30px_rgba(0,243,255,0.3)]">
            <span class="-rotate-45 text-white/80 font-light text-xs sm:text-sm tracking-widest">Explore</span>
          </span>
          <span class="text-white/35 text-[0.65rem] sm:text-xs tracking-[0.35em] sm:tracking-[0.4em] uppercase mt-1">
            Building the future of the web
          </span>
        </button>
      </div>

      <!-- Scroll hint -->
      <div class="absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:bottom-8 flex flex-col items-center gap-2 text-white/25">
        <p class="text-[0.65rem] sm:text-xs tracking-[0.35em] sm:tracking-[0.4em] uppercase">Scroll to navigate</p>
        <div class="w-px h-8 bg-gradient-to-b from-white/25 to-transparent animate-bounce"></div>
      </div>
    </div>
  `,
})
export class HeroSlideComponent {
  private navService = inject(ScrollNavigationService);

  onEnter(): void {
    this.navService.next();
  }
}
