import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DetailBarComponent } from './detail-bar/detail-bar.component';
import { BackgroundAnimationThreeComponent } from '../shared/components/background-animation-three/background-animation-three.component';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, DetailBarComponent, BackgroundAnimationThreeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative flex flex-col min-h-screen text-slate-900 dark:text-white transition-colors duration-300">
      <app-background-animation-three />
      <app-detail-bar />
      <main class="flex-grow pt-16 pb-8">
        <router-outlet />
      </main>
    </div>
  `,
  styles: ``,
})
export class MainLayoutComponent {}
