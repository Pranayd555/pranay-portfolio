import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about-slide',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="absolute inset-0 flex items-center justify-center select-none px-5 sm:px-10">
    <ng-content></ng-content>
      <div class="relative z-10 flex flex-col items-center text-center w-full max-w-[44rem]">

        <p class="text-[0.65rem] sm:text-xs tracking-[0.45em] text-white/40 uppercase mb-5 sm:mb-6 font-light">
          02 / 06
        </p>

        <h1 class="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold uppercase leading-[0.9] mb-3
                   tracking-[0.16em] sm:tracking-[0.22em] md:tracking-[0.3em]
                   text-[#f3a000] drop-shadow-[0_0_40px_rgba(243,160,0,0.4)]">
          ABOUT
        </h1>

        <p class="text-[0.7rem] sm:text-sm text-white/50 tracking-[0.28em] sm:tracking-[0.35em] uppercase mb-8 sm:mb-10 font-light">
          By Pranay Das
        </p>

        <!-- Diamond Enter button -->
        <button
          type="button"
          class="relative flex flex-col items-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3a000]/60 rounded-2xl"
          (click)="enter()"
          aria-label="Enter About page"
        >
          <span class="w-16 h-16 sm:w-20 sm:h-20 rotate-45 border border-white/30 bg-white/5
                       flex items-center justify-center cursor-pointer
                       hover:bg-white/15 hover:border-[#f3a000]/60 transition-all duration-300
                       hover:shadow-[0_0_30px_rgba(243,160,0,0.35)]">
            <span class="-rotate-45 text-white/80 font-light text-xs sm:text-sm tracking-widest">Enter</span>
          </span>
          <span class="text-white/35 text-[0.65rem] sm:text-xs tracking-[0.35em] sm:tracking-[0.4em] uppercase mt-1">
            The Story
          </span>
        </button>
      </div>
    </div>
  `,
})
export class AboutSlideComponent {
  private router = inject(Router);

  enter(): void {
    this.router.navigate(['/about']);
  }
}
