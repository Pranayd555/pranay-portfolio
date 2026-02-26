import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-playground-slide',
  imports: [],
  templateUrl: './playground-slide.html',
  styleUrl: './playground-slide.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaygroundSlideComponent {
  private router = inject(Router);

  enter(): void {
    this.router.navigate(['/playground']);
  }
}
