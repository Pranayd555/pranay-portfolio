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

type PlaygroundAnimationId = 'hero-icon-particles' | 'spinning-sphere';

interface PlaygroundAnimation {
  id: PlaygroundAnimationId;
  label: string;
}

@Component({
  selector: 'app-playground-page',
  imports: [CommonModule, HeroIconParticlesComponent, BackgroundAnimationThreeComponent, DetailBarComponent],
  templateUrl: './playground-page.html',
  styleUrl: './playground-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaygroundPageComponent {
  protected readonly animations: readonly PlaygroundAnimation[] = [
    {
      id: 'spinning-sphere',
      label: 'Spinning Sphere',
    },
    {
      id: 'hero-icon-particles',
      label: 'Hero Icon Particles',
    },
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
