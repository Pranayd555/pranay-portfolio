import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { IProject } from '../types/projects.model';
import { projectsData } from '../../data/projects.data';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {

  getProjects(): Observable<IProject[]> {
    return of(projectsData).pipe(delay(2000));
  }

}
