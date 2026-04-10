import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { IExperience } from '../types/experience.model';
import { experienceData } from '../../data/experience-data';

@Injectable({
  providedIn: 'root',
})
export class ExperienceService {

  getExperience(): Observable<IExperience[]> {
    return of(experienceData).pipe(delay(1000));
  }
}
