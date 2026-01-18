import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hero } from './sections/hero/hero';
import { Experience } from './sections/experience/experience';
import { Projects } from './sections/projects/projects';
import { Skills } from './sections/skills/skills';
import { Education } from './sections/education/education';
import { Contact } from './sections/contact/contact';
@Component({
    selector: 'app-home',
    imports: [CommonModule, Hero, Experience, Projects, Skills, Education, Contact],
    template: `
    <div class="min-h-screen pb-24 pt-10">
      
      <!-- Hero Section -->
      <app-hero></app-hero>

      <!-- Experience Section -->
      <app-experience></app-experience>

      <!-- Projects Section -->
      <app-projects></app-projects>
      
      <!-- Skills Section -->
      <app-skills></app-skills>
      
      <!-- Education & Certifications -->
      <app-education></app-education>

      <!-- Contact Section -->
      <app-contact></app-contact>
    </div>
  `,
    styles: ``
})
export class HomeComponent {

}
