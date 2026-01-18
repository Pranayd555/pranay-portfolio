import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IEducationSection } from './education.model';
import { EducationService } from './education-service';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './education.html',
  styleUrl: './education.css',
})
export class Education implements OnInit {

  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');
  educationSectionData = signal<IEducationSection | null>(null);
  educationData = computed(() => this.educationSectionData()?.education || []);
  certificationData = computed(() => this.educationSectionData()?.certifications || []);

  constructor(private educationService: EducationService) { }

  ngOnInit(): void {
    this.loadEducation();
  }

  loadEducation(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.errorMessage.set('');

    this.educationService.getEducation().subscribe({
      next: (educationData) => {
        this.educationSectionData.set(educationData);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.hasError.set(true);
        this.errorMessage.set('Failed to load education data. Please try again.');
        this.isLoading.set(false);
        console.error('Error loading education:', error);
      }
    });
  }

  retryLoad(): void {
    this.loadEducation();
  }
}
