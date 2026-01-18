import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExperienceService } from './experience-service';
import { IExperience } from './experience.model';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './experience.html',
  styleUrl: './experience.css',
})
export class Experience implements OnInit {
  // Using signals instead of BehaviorSubjects
  public experiences = signal<IExperience[]>([]);
  public isLoading = signal<boolean>(true);
  public hasError = signal<boolean>(false);
  public errorMessage = signal<string>('');

  constructor(private experienceService: ExperienceService) { }

  ngOnInit(): void {
    this.loadExperiences();
  }

  loadExperiences(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.errorMessage.set('');

    this.experienceService.getExperience().subscribe({
      next: (data) => {
        this.experiences.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.hasError.set(true);
        this.errorMessage.set('Failed to load experience data. Please try again.');
        console.error('Error loading experiences:', error);
        this.experiences.set([]);
      }
    });
  }

  retryLoad(): void {
    this.loadExperiences();
  }

  // Helper method to format period display
  formatPeriod(period: { start: string; end: string }): string {
    return `${period.start} - ${period.end}`;
  }
}
