import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Hero } from '../home/sections/hero/hero';
import { Skills } from '../home/sections/skills/skills';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [Hero, Skills],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen pt-4 pb-24">
      <app-hero />
      <app-skills />
    </div>
  `,
})
export class AboutComponent {
  private router = inject(Router);
}
