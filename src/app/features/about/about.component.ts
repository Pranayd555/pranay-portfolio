import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Hero } from '../home/sections/hero/hero';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [Hero],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen pt-4 pb-24">
      <app-hero />
    </div>
  `,
})
export class AboutComponent {
  private router = inject(Router);
}
