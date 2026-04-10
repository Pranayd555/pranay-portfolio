import { Injectable } from '@angular/core';
import { IEducationSection } from '../types/education.model';
import { delay, Observable, of } from 'rxjs';
import { educationData } from '../../data/education-data';

@Injectable({
  providedIn: 'root',
})
export class EducationService {

  getEducation(): Observable<IEducationSection> {
    return of(educationData).pipe(delay(1000));
  }

}
