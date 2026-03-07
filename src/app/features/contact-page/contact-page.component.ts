import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Contact } from '../home/sections/contact/contact';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [Contact],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen pt-10 pb-24">
      <app-contact />
    </div>
  `,
})
export class ContactPageComponent {}
