import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkillsService } from './skills-service';
import { ISkillCategory } from './skills.model';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills.html',
  styleUrl: './skills.css',
})
export class Skills implements OnInit {

  public skills = signal<ISkillCategory[]>([]);
  public isLoading = signal<boolean>(true);
  public hasError = signal<boolean>(false);
  public errorMessage = signal<string>('');

  constructor(private skillsService: SkillsService) { }

  ngOnInit(): void {
    this.loadSkills();
  }

  loadSkills(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.errorMessage.set('');

    this.skillsService.getSkills().subscribe({
      next: (skills) => {
        this.skills.set(skills);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.hasError.set(true);
        this.errorMessage.set('Failed to load skills data. Please try again.');
        console.error('Error loading skills:', error);
        this.skills.set([]);
      }
    });
  }

  retryLoad(): void {
    this.loadSkills();
  }
}
