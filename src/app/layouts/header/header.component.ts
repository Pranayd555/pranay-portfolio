import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <nav class="fixed top-0 w-full z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div class="flex items-center p-4 justify-between max-w-7xl mx-auto">
        <!-- Logo & Profile -->
        <div class="flex items-center gap-3">
            <div class="flex size-10 shrink-0 items-center overflow-hidden rounded-full border-2 border-primary cursor-pointer" (click)="routeToHome()">
                <div class="bg-center bg-no-repeat aspect-square bg-cover size-full" data-alt="Professional headshot" style='background-image: url("assets/pranay_logo.png");'></div>
            </div>
            <h2 class="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">Pranay Das</h2>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center gap-8">
            <a [routerLink]="['/']" fragment="hero" class="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors font-medium text-sm uppercase tracking-wide cursor-pointer">Home</a>
            <a [routerLink]="['/']" fragment="experience" class="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors font-medium text-sm uppercase tracking-wide cursor-pointer">Experience</a>
            <a [routerLink]="['/']" fragment="projects" class="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors font-medium text-sm uppercase tracking-wide cursor-pointer">Projects</a>
            <a [routerLink]="['/']" fragment="skills" class="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors font-medium text-sm uppercase tracking-wide cursor-pointer">Skills</a>
            <a [routerLink]="['/']" fragment="contact" class="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors font-medium text-sm uppercase tracking-wide cursor-pointer">Contact</a>
        </div>

        <!-- Right Side: Theme Toggle & Mobile Menu -->
        <div class="flex items-center gap-4">
            <!-- Theme Toggle -->
            <button (click)="themeService.toggleTheme()" class="flex items-center justify-center size-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <span class="material-symbols-outlined text-[20px]">
                    {{ themeService.darkMode() ? 'light_mode' : 'dark_mode' }}
                </span>
            </button>

            <!-- Mobile Menu Button -->
            <button (click)="toggleMenu()" class="md:hidden flex items-center justify-center rounded-full size-10 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <span class="material-symbols-outlined">{{ isMenuOpen() ? 'close' : 'menu' }}</span>
            </button>
        </div>
      </div>

      <!-- Mobile Navigation Dropdown -->
      <div *ngIf="isMenuOpen()" class="md:hidden border-t border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark">
        <div class="flex flex-col p-4 space-y-4">
            <a (click)="closeMenu()" [routerLink]="['/']" fragment="hero" class="text-slate-900 dark:text-white hover:text-primary font-medium text-lg">Home</a>
            <a (click)="closeMenu()" [routerLink]="['/']" fragment="experience" class="text-slate-900 dark:text-white hover:text-primary font-medium text-lg">Experience</a>
            <a (click)="closeMenu()" [routerLink]="['/']" fragment="projects" class="text-slate-900 dark:text-white hover:text-primary font-medium text-lg">Projects</a>
            <a (click)="closeMenu()" [routerLink]="['/']" fragment="skills" class="text-slate-900 dark:text-white hover:text-primary font-medium text-lg">Skills</a>
            <a (click)="closeMenu()" [routerLink]="['/']" fragment="contact" class="text-slate-900 dark:text-white hover:text-primary font-medium text-lg">Contact</a>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class HeaderComponent {
  themeService = inject(ThemeService);
  isMenuOpen = signal(false);
  router = inject(Router);

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  routeToHome() {
    this.router.navigate(['/']);
  }
}
