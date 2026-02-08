import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-floating-nav',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50">
      <div class="bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl border border-white/10 rounded-full p-2 shadow-2xl flex items-center justify-between transition-colors duration-300">
        <button class="size-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
          <span class="material-symbols-outlined">home</span>
        </button>
        <button class="size-12 rounded-full text-slate-400 hover:text-primary transition-colors flex items-center justify-center">
          <span class="material-symbols-outlined">architecture</span>
        </button>
        <button class="size-12 rounded-full text-slate-400 hover:text-primary transition-colors flex items-center justify-center">
          <span class="material-symbols-outlined">history</span>
        </button>
        <button class="size-12 rounded-full text-slate-400 hover:text-primary transition-colors flex items-center justify-center">
          <span class="material-symbols-outlined">chat_bubble</span>
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class FloatingNavComponent { }
