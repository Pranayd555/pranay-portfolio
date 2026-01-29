import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { IProject } from '../types/projects.model';
import { projectsData } from '../../data/projects.data';
import { IProjectDetails } from '../types/projectDetails.model';
import { projectDetailsData } from '../../data/project-details';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {

  getProjects(): Observable<IProject[]> {
    return of(projectsData).pipe(delay(2000));
  }

  getProjectById(id: string): Observable<IProjectDetails> {
    const project = projectDetailsData.find(p => p.id === id);
    if (!project) {
      return throwError(() => new Error('Project not found'));
    }
    return of(project).pipe(delay(2000));
  }

}
