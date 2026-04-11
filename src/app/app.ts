import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FloatingNavComponent } from './layouts/floating-nav/floating-nav';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FloatingNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('my-portfolio');
}
