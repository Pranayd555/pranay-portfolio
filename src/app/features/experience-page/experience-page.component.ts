import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Experience } from '../home/sections/experience/experience';
import { Education } from '../home/sections/education/education';

@Component({
  selector: 'app-experience-page',
  standalone: true,
  imports: [Experience, Education],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen pt-10 pb-24">
      <app-experience />
      <app-education />
    </div>
  `,
})
export class ExperiencePageComponent {}
