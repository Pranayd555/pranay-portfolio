import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { BackgroundAnimationComponent } from '../shared/components/background-animation/background-animation.component';

/**
 * Main Layout Component
 * 
 * Provides the app shell with header, footer, and router outlet.
 * This layout wraps all routed content.
 */
@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, BackgroundAnimationComponent],
  template: `
    <div class="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-300">
      <app-background-animation />
      <app-header />
      
      <main class="flex-grow pt-20">
        <router-outlet />
      </main>
      
      <app-footer />
    </div>
  `,
  styles: ``
})
export class MainLayoutComponent { }
