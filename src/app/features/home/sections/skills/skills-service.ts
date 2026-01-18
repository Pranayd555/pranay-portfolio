import { Injectable } from '@angular/core';
import { skillsData } from './skills-data';
import { delay, Observable, of } from 'rxjs';
import { ISkillCategory } from './skills.model';

@Injectable({
  providedIn: 'root',
})
export class SkillsService {

  getSkills(): Observable<ISkillCategory[]> {
    return of(skillsData as ISkillCategory[]).pipe(delay(2000));
  }

}
