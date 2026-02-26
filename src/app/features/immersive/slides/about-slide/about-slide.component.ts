import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about-slide',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="absolute inset-0 flex flex-col items-center justify-center select-none">
      <div class="relative z-10 flex flex-col items-center text-center px-8">

        <p class="text-xs tracking-[0.5em] text-white/40 uppercase mb-6 font-light">
          02 / 05
        </p>

        <h1 class="text-5xl sm:text-7xl md:text-8xl font-bold tracking-[0.3em] uppercase leading-none mb-3"
            style="color:#f3a000; text-shadow: 0 0 40px rgba(243,160,0,0.4);">
          ABOUT
        </h1>

        <p class="text-sm text-white/50 tracking-[0.35em] uppercase mb-10 font-light">
          By Pranav Das
        </p>

        <!-- Diamond Enter button -->
        <div class="relative flex flex-col items-center gap-4" (click)="enter()">
          <div class="w-20 h-20 rotate-45 border border-white/30 bg-white/5
                      flex items-center justify-center cursor-pointer
                      hover:bg-white/15 hover:border-[#f3a000]/60 transition-all duration-300
                      hover:shadow-[0_0_30px_rgba(243,160,0,0.35)]">
            <span class="-rotate-45 text-white/80 font-light text-sm tracking-widest">Enter</span>
          </div>
          <p class="text-white/35 text-xs tracking-[0.4em] uppercase mt-2">
            The Story
          </p>
        </div>
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
