import { Injectable } from '@angular/core';
import { IProject } from './projects.model';
import { projectsData } from './projects.data';
import { delay, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {

  getProjects(): Observable<IProject[]> {
    return of(projectsData).pipe(delay(2000));
  }

}
