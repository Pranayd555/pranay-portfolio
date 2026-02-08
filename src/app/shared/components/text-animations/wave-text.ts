import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

@Component({
  selector: 'wave-text',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="wave-container wrap {{ classes() }}"
      (mouseenter)="wave()"
    >
      @for (char of letters(); track $index) {
        <span 
          [class.wave-enter]="animationDelay()[$index]"
          class="char"
          [style.animationDelay]="$index * delay() + 'ms'"
        >
          {{ char === ' ' ? '\u00A0' : char }}
        </span>
      }
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
  readonly text = input<string>('');
  readonly classes = input<string>('');
  readonly delay = input<number>(60); // ms between letters
  protected readonly animationDelay = signal<Array<boolean>>([]);
  private isReset: boolean = false;
  private animationTimer: number = 1000;

  protected readonly letters = computed(() => this.text().split(''));

  wave(): void {
    if (this.isReset) return;
    this.isReset = false;
    let timer = 0;
    const lettersList = this.letters();
    const delayValue = this.delay();
    timer = ((lettersList.length - 1) * delayValue * 2) + this.animationTimer;
    lettersList.forEach((_, index) => {
      const t = setTimeout(() => {
        clearTimeout(t);
        this.animationDelay.update(
          (prev: boolean[]) => [...prev, prev[index] = true]
        );
      }, index * delayValue);
      index === lettersList.length - 1 && this.resetAnimation(timer);
    });
  }

  private resetAnimation(timer: number = 0): void {
    this.isReset = true;
    const t = setTimeout(() => {
      clearTimeout(t);
      this.isReset = false;
      this.animationDelay.set([]);
    }, timer);
  }
}
