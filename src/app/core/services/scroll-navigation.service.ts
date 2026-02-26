import { Injectable, signal } from '@angular/core';

export interface SlideConfig {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly enterLabel: string;
  readonly route: string | null;
}

export const SLIDES: readonly SlideConfig[] = [
  {
    id: 'hero',
    title: 'PRANAV DAS',
    subtitle: 'Sr. Software Engineer',
    description: 'Building the future of the web',
    enterLabel: 'Explore',
    route: null,
  },
  {
    id: 'about',
    title: 'ABOUT',
    subtitle: 'Who I Am',
    description: 'The Story',
    enterLabel: 'Enter',
    route: '/about',
  },
  {
    id: 'projects',
    title: 'PROJECTS',
    subtitle: 'My Work',
    description: 'The Projects',
    enterLabel: 'Enter',
    route: '/projects',
  },
  {
    id: 'experience',
    title: 'EXPERIENCE',
    subtitle: 'My Journey',
    description: 'The Timeline',
    enterLabel: 'Enter',
    route: '/experience',
  },
  {
    id: 'contact',
    title: 'CONTACT',
    subtitle: 'Get In Touch',
    description: "Let's Talk",
    enterLabel: 'Say Hello',
    route: '/contact',
  },
  {
    id: 'playground',
    title: 'PLAYGROUND',
    subtitle: 'My Playground',
    description: 'The Playground',
    enterLabel: 'Enter',
    route: '/playground',
  },
] as const;

@Injectable({ providedIn: 'root' })
export class ScrollNavigationService {
  readonly TOTAL_SLIDES = SLIDES.length;
  readonly slides = SLIDES;

  readonly currentSlide = signal<number>(0);

  private isLocked = false;
  private lockTimeout?: ReturnType<typeof setTimeout>;
  private readonly LOCK_DURATION = 800;

  next(): void {
    if (this.isLocked) return;
    this.currentSlide.update(v => Math.min(v + 1, this.TOTAL_SLIDES - 1));
    this.lock();
  }

  prev(): void {
    if (this.isLocked) return;
    this.currentSlide.update(v => Math.max(v - 1, 0));
    this.lock();
  }

  goTo(index: number): void {
    if (index < 0 || index >= this.TOTAL_SLIDES || this.isLocked) return;
    this.currentSlide.set(index);
    this.lock();
  }

  resetToFirst(): void {
    this.currentSlide.set(0);
    this.isLocked = false;
    if (this.lockTimeout) clearTimeout(this.lockTimeout);
  }

  private lock(): void {
    this.isLocked = true;
    if (this.lockTimeout) clearTimeout(this.lockTimeout);
    this.lockTimeout = setTimeout(() => {
      this.isLocked = false;
    }, this.LOCK_DURATION);
  }
}
