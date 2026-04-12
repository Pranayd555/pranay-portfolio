import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Contact } from '../home/sections/contact/contact';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [Contact],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
      <app-contact />
  `,
})
export class ContactPageComponent {}
