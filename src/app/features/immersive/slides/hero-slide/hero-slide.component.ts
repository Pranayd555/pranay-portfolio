import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { ScrollNavigationService } from '../../../../core/services/scroll-navigation.service';
import { HeroIconParticlesComponent } from '../../../../shared/components/hero-icon-particles/hero-icon-particles.component';

@Component({
  selector: 'app-hero-slide',
  standalone: true,
  imports: [HeroIconParticlesComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="absolute inset-0 flex flex-col items-center justify-center select-none">
      <!-- Skill icon sprites (Three.js) -->
      <app-hero-icon-particles />

      <!-- Center overlay content -->
      <div class="relative z-10 flex flex-col items-center text-center px-8">
        <p class="text-xs tracking-[0.5em] text-white/40 uppercase mb-6 font-light">
          Welcome
        </p>

        <h1 class="text-5xl sm:text-7xl md:text-8xl font-bold tracking-[0.2em] text-white uppercase leading-none mb-3"
            style="text-shadow: 0 0 40px rgba(0,243,255,0.35);">
          PRANAV DAS
        </h1>

        <p class="text-sm text-white/50 tracking-[0.35em] uppercase mb-10 font-light">
          Sr. Software Engineer
        </p>

        <!-- Diamond Explore button -->
        <div class="relative flex flex-col items-center gap-4" (click)="onEnter()">
          <div class="w-20 h-20 rotate-45 border border-white/30 bg-white/5
                      flex items-center justify-center cursor-pointer
                      hover:bg-white/15 hover:border-white/60 transition-all duration-300
                      hover:shadow-[0_0_30px_rgba(0,243,255,0.3)]">
            <span class="-rotate-45 text-white/80 font-light text-sm tracking-widest">Explore</span>
          </div>
          <p class="text-white/35 text-xs tracking-[0.4em] uppercase mt-2">
            Building the future of the web
          </p>
        </div>
      </div>

      <!-- Scroll hint -->
      <div class="absolute bottom-8 flex flex-col items-center gap-2 text-white/25">
        <p class="text-xs tracking-[0.4em] uppercase">Scroll to navigate</p>
        <div class="w-px h-8 bg-gradient-to-b from-white/25 to-transparent animate-bounce"></div>
      </div>
    </div>
  `,
})
export class HeroSlideComponent {
  private navService = inject(ScrollNavigationService);
  onEnterClick = output<void>();

  onEnter(): void {
    this.navService.next();
  }
}
