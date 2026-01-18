import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectsService } from './projects-service';
import { IProject } from './projects.model';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects implements OnInit {

  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');
  projects = signal<IProject[]>([]);

  constructor(private projectsService: ProjectsService) { }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.errorMessage.set('');

    this.projectsService.getProjects().subscribe({
      next: (data) => {
        this.projects.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.hasError.set(true);
        this.errorMessage.set('Failed to load projects data. Please try again.');
        console.error('Error loading projects:', error);
        this.projects.set([]);
      }
    });
  }

  retryLoad(): void {
    this.loadProjects();
  }
}
