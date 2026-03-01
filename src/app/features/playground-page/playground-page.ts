import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroIconParticlesComponent } from '../../shared/components/hero-icon-particles/hero-icon-particles.component';
import { BackgroundAnimationThreeComponent } from '../../shared/components/background-animation-three/background-animation-three.component';
import { DetailBarComponent } from '../../layouts/detail-bar/detail-bar.component';
import { AboutParticleBgComponent, SlideParticleBgComponent, WaveParticleBgComponent } from '../../shared';
import { TextScrapperAnimation } from '../../shared/components/text-scrapper-animation/text-scrapper-animation';

type PlaygroundAnimationId =
  | 'hero-icon-particles'
  | 'spinning-sphere'
  | 'slide-particle-bg'
  | 'about-particle-bg'
  | 'wave-particle-bg'
  | 'text-scrapper-animation';

interface PlaygroundAnimation {
  id: PlaygroundAnimationId;
  label: string;
}

@Component({
  selector: 'app-playground-page',
  imports: [
    CommonModule,
    HeroIconParticlesComponent,
    BackgroundAnimationThreeComponent,
    DetailBarComponent,
    SlideParticleBgComponent,
    AboutParticleBgComponent,
    WaveParticleBgComponent,
    TextScrapperAnimation,
  ],
  templateUrl: './playground-page.html',
  styleUrl: './playground-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaygroundPageComponent {
  protected readonly animations: readonly PlaygroundAnimation[] = [
    
    {
      id: 'text-scrapper-animation',
      label: 'Text Scrapper Animation',
    },
    {
      id: 'spinning-sphere',
      label: 'Spinning Sphere',
    },
    {
      id: 'hero-icon-particles',
      label: 'Hero Icon Particles',
    },
    {
      id: 'slide-particle-bg',
      label: 'Slide Particle BG',
    },
    {
      id: 'about-particle-bg',
      label: 'About Particle BG',
    },
    {
      id: 'wave-particle-bg',
      label: 'Wave Particle BG',
    }
  ] as const;

  protected readonly selectedId = signal<PlaygroundAnimationId>(this.animations[0].id);

  protected readonly selected = computed<PlaygroundAnimation>(() => {
    const found = this.animations.find(a => a.id === this.selectedId());
    return found ?? this.animations[0];
  });

  protected select(id: PlaygroundAnimationId): void {
    this.selectedId.set(id);
  }

  protected trackByAnimId(_index: number, anim: PlaygroundAnimation): PlaygroundAnimationId {
    return anim.id;
  }
}
