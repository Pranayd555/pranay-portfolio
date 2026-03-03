import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroIconParticlesComponent } from '../../shared/components/hero-icon-particles/hero-icon-particles.component';
import { BackgroundAnimationThreeComponent } from '../../shared/components/background-animation-three/background-animation-three.component';
import { DetailBarComponent } from '../../layouts/detail-bar/detail-bar.component';
import { AboutParticleBgComponent, ConnectParticleBg, SlideParticleBgComponent, WaveParticleBgComponent } from '../../shared';
import { TextScrapperAnimation } from '../../shared/components/text-scrapper-animation/text-scrapper-animation';

type PlaygroundAnimationId =
  | 'hero-icon-particles'
  | 'spinning-sphere'
  | 'slide-particle-bg'
  | 'about-particle-bg'
  | 'wave-particle-bg'
  | 'text-scrapper-animation'
  | 'connect-particle-bg';

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
    ConnectParticleBg,
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
    },
    {
      id: 'connect-particle-bg',
      label: 'Connect BG',
    }
  ] as const;

  protected readonly selectedId = signal<PlaygroundAnimationId>(this.animations[0].id);

  protected readonly pickerOpen = signal(false);

  protected readonly selected = computed<PlaygroundAnimation>(() => {
    const found = this.animations.find(a => a.id === this.selectedId());
    return found ?? this.animations[0];
  });

  protected select(id: PlaygroundAnimationId): void {
    this.selectedId.set(id);
    this.pickerOpen.set(false);
  }

  protected openPicker(): void {
    this.pickerOpen.set(true);
  }

  protected closePicker(): void {
    this.pickerOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.pickerOpen()) {
      this.closePicker();
    }
  }

  protected trackByAnimId(_index: number, anim: PlaygroundAnimation): PlaygroundAnimationId {
    return anim.id;
  }
}
