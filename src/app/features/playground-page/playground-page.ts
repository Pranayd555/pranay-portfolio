import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroIconParticlesComponent } from '../../shared/components/hero-icon-particles/hero-icon-particles.component';

@Component({
  selector: 'app-playground-page',
  imports: [HeroIconParticlesComponent],
  templateUrl: './playground-page.html',
  styleUrl: './playground-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaygroundPageComponent {
}
