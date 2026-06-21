import { ChangeDetectionStrategy, Component, effect, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationStart, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Chat } from '../../shared/components/chat/chat';
import { GeminiAi } from '../../services/gemini-ai';
import { ALLOWED_PROJECTS } from '../../core/config/project.config';

@Component({
  selector: 'app-floating-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, Chat],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './floating-nav.html',
  styleUrl: './floating-nav.css'
})
export class FloatingNavComponent {

  @ViewChild('chatModal')
  chatModalElement!: ElementRef<HTMLDialogElement>;

  readonly router = inject(Router);
  readonly projects = ALLOWED_PROJECTS;
 
  navOpen  = signal(false);
  projOpen = signal(false);
  chatOpen = signal(false);
  hasRoutedFromDefault = signal(false);
  geminiAI = inject(GeminiAi);

  constructor() {
    this.router.events.pipe(
      takeUntilDestroyed()
    ).subscribe( e => {
      if(e instanceof NavigationStart) {
        this.closeNav();
      }
    })

    
  effect(() => {
    const modal = this.chatModalElement?.nativeElement;
    if (!modal) return;

    const isOpen = this.chatOpen();

    if (isOpen && !modal.open) {
      modal.showModal();
    } else if (!isOpen && modal.open) {
      modal.close();
    }
});
  
  this.geminiAI.showChat.pipe(
    takeUntilDestroyed()
  ).subscribe(v => {
    this.chatOpen.set(v);
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

  toggleChat(): void {
    this.chatOpen.update(v => !v);
  }

  closeChat(close: Event): void {
    if(close) {
      this.chatOpen.set(false);
    }
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
