import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { ISkillCategory } from '../types/skills.model';
import { skillsData } from '../../data/skills-data';

@Injectable({
  providedIn: 'root',
})
export class SkillsService {

  getSkills(): Observable<ISkillCategory[]> {
    return of(skillsData as ISkillCategory[]).pipe(delay(1000));
  }

}
