import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Projects } from '../home/sections/projects/projects';
import { Skills } from '../home/sections/skills/skills';

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [Projects, Skills],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pt-10 pb-24">
      <app-projects />
      <app-skills />
    </div>
  `,
})
export class ProjectsPageComponent {}
