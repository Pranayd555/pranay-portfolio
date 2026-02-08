import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WaveTextComponent } from "../../../../shared/components/text-animations/wave-text";

@Component({
  selector: 'app-hero',
  imports: [RouterLink, WaveTextComponent, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  currentRole = signal('');
  private roles = ['Sr. Software Engineer', 'Full Stack Web Developer', 'Product Engineer', 'Active Learner'];
  loopNum = 0;
  private isDeleting = false;
  private timer: any;
  imageClicked = signal<boolean | null>(false);
  imageChanged = signal<boolean>(true);


  x = signal(0);
  y = signal(0);

  private isDragging = false;
  private lastX = 0;
  private lastY = 0;

  private velocityX = 0;
  private velocityY = 0;

  // physics constants
  private friction = 0.92;
  private spring = 0.08;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.type();
      this.isImageClicked();
    } else {
      this.currentRole.set(this.roles[0]); // Fallback for SSR
    }
  }

  isImageClicked() {
    this.imageClicked.set(!this.imageClicked());
    const t = setTimeout(() => {
      clearTimeout(t);
      this.imageChanged.set(!this.imageChanged());
    }, 500);
  }

  ngOnDestroy() {
    if (this.timer) clearTimeout(this.timer);
  }

  private type() {
    const i = this.loopNum % this.roles.length;
    const fullTxt = this.roles[i];

    if (this.isDeleting) {
      this.currentRole.update((value) => fullTxt.substring(0, value.length - 1));
    } else {
      this.currentRole.update((value) => fullTxt.substring(0, value.length + 1));
    }

    let delta = 200 - Math.random() * 100;

    if (this.isDeleting) { delta /= 2; }

    if (!this.isDeleting && this.currentRole() === fullTxt) {
      delta = 2000; // Wait at end
      this.isDeleting = true;
    } else if (this.isDeleting && this.currentRole() === '') {
      this.isDeleting = false;
      this.loopNum++;
      delta = 500;
    }

    this.timer = setTimeout(() => this.type(), delta);
  }

  transform = () =>
    `translate(${this.x()}px, ${this.y()}px)`;

  // --- drag start ---
  startDrag(event: PointerEvent) {
    event.stopPropagation();
    this.isDragging = true;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }

  // --- dragging ---
  onDrag(event: PointerEvent) {
    if (!this.isDragging) return;
    event.stopPropagation();

    const dx = event.clientX - this.lastX;
    const dy = event.clientY - this.lastY;

    this.velocityX = dx;
    this.velocityY = dy;

    this.x.update(v => v + dx);
    this.y.update(v => v + dy);

    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }

  // --- release ---
  endDrag() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.animateBounce();
  }

  // --- bounce physics ---
  private animateBounce() {
    const animate = () => {
      // spring force back to center (0,0)
      const forceX = -this.x() * this.spring;
      const forceY = -this.y() * this.spring;

      this.velocityX += forceX;
      this.velocityY += forceY;

      this.velocityX *= this.friction;
      this.velocityY *= this.friction;

      this.x.update(v => v + this.velocityX);
      this.y.update(v => v + this.velocityY);

      // stop condition
      if (
        Math.abs(this.velocityX) < 0.1 &&
        Math.abs(this.velocityY) < 0.1 &&
        Math.abs(this.x()) < 0.5 &&
        Math.abs(this.y()) < 0.5
      ) {
        this.x.set(0);
        this.y.set(0);
        return;
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }
}
