import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Projects } from '../home/sections/projects/projects';

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [Projects],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen pt-10 pb-24">
      <app-projects />
    </div>
  `,
})
export class ProjectsPageComponent {}
