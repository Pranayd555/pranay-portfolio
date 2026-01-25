import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'wave-text',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="wave-container wrap {{ classes }}"
      (mouseenter)="wave()"
    >
      <span 
      [class.wave-enter]="animationDelay()[i]"
        *ngFor="let char of letters; let i = index"
        class="char"
        [style.animationDelay]="i * delay + 'ms'"
        
      >
      {{ char === ' ' ? '\u00A0' : char }}
      </span>
    </span>
  `,
  styles: [`
    .wave-container {
      display: inline-block;
    }

    .char {
      display: inline-block;
    }

    .wave-enter {
      transition: transform 0.3s ease-in-out;
      animation: wave 1s ease-in-out 1;
    }

    @keyframes wave {
      0% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-6px);
      }
      100% {
        transform: translateY(0);
      }
    }
    
  `]
})
export class WaveTextComponent {
  @Input() text = '';
  @Input() classes = '';
  @Input() delay = 60; // ms between letters
  animationDelay = signal<Array<boolean>>([]);
  private isReset: boolean = false;
  private animationTimer: number = 1000;

  get letters(): string[] {
    return this.text.split('');
  }

  wave() {
    if (this.isReset) return;
    this.isReset = false;
    let timer = 0;
    timer = ((this.letters.length - 1) * this.delay * 2) + this.animationTimer;
    this.letters.forEach((_, index) => {
      const t = setTimeout(() => {
        clearTimeout(t);
        this.animationDelay.update(
          (prev: boolean[]) => [...prev, prev[index] = true]
        );
      }, index * this.delay);
      index === this.letters.length - 1 && this.resetAnimation(timer);
    })

  }

  resetAnimation(timer: number = 0) {
    this.isReset = true;
    const t = setTimeout(() => {
      clearTimeout(t);
      this.isReset = false;
      this.animationDelay.set([]);
    }, timer);
  }
}
