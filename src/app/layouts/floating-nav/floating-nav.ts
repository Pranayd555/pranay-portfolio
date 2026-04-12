import { ChangeDetectionStrategy, Component, effect, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationStart, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-floating-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './floating-nav.html',
  styleUrl: './floating-nav.css'
})
export class FloatingNavComponent {

  private router = inject(Router);
 
  navOpen  = signal(false);
  projOpen = signal(false);

  constructor() {
    this.router.events.pipe(
      takeUntilDestroyed()
    ).subscribe( e => {
      if(e instanceof NavigationStart) {
        this.closeNav();
      }
    })
  }
 
  toggleNav(): void {
    this.navOpen.update(v => !v);
  }
 
  closeNav(): void {
    this.navOpen.set(false);
    this.projOpen.set(false);
  }
 
  toggleProjects(): void {
    this.projOpen.update(v => !v);
  }
 
  /** Marks the Projects button active when any child route is active */
  isProjectsRouteActive(): boolean {
    return this.router.url.startsWith('/projects');
  }
 
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.navOpen()) this.closeNav();
  }
 }
