import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero',
  imports: [RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  currentRole = '';
  private roles = ['Sr. Software Engineer', 'Full Stack Web Developer', 'Product Engineer', 'Active Learner'];
  loopNum = 0;
  private isDeleting = false;
  private typeSpeed = 150;
  private timer: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.type();
    } else {
      this.currentRole = this.roles[0]; // Fallback for SSR
    }
  }

  ngOnDestroy() {
    if (this.timer) clearTimeout(this.timer);
  }

  private type() {
    const i = this.loopNum % this.roles.length;
    const fullTxt = this.roles[i];

    if (this.isDeleting) {
      this.currentRole = fullTxt.substring(0, this.currentRole.length - 1);
    } else {
      this.currentRole = fullTxt.substring(0, this.currentRole.length + 1);
    }

    this.cdr.markForCheck();

    let delta = 200 - Math.random() * 100;

    if (this.isDeleting) { delta /= 2; }

    if (!this.isDeleting && this.currentRole === fullTxt) {
      delta = 2000; // Wait at end
      this.isDeleting = true;
    } else if (this.isDeleting && this.currentRole === '') {
      this.isDeleting = false;
      this.loopNum++;
      delta = 500;
    }

    this.timer = setTimeout(() => this.type(), delta);
  }
}
