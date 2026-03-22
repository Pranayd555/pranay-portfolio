import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-detail-bar',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Logo: top-left -->
    <a
      routerLink="/"
      class="fixed top-4 left-4 z-50 flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-sm cursor-pointer hover:border-secondary transition-colors"
      aria-label="Back to home"
    >
      <img
        src="/pranay_logo.png"
        alt="Pranay Das"
        loading="lazy"
        class="h-full w-full object-cover"
      />
    </a>

    <!-- Floating back button: bottom-right -->
    <button
      (click)="goBack()"
      class="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-white/10 dark:bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-primary transition-all shadow-lg hover:scale-105 cursor-pointer"
      aria-label="Back to previous"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
      </svg>
    </button>
  `,
})
export class DetailBarComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly platformId = inject(PLATFORM_ID);

  goBack(): void {
    if (isPlatformBrowser(this.platformId) && typeof history !== 'undefined' && history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}
