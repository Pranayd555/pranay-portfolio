import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ISkillCategory } from './types/skills.model';
import { ISkillsState } from './types/skilsState.model';
import { Store } from '@ngrx/store';
import * as SkillsActions from './store/actions';
import * as SkillsSelectors from './store/selectors';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills.html',
  styleUrl: './skills.css',
})
export class Skills implements OnInit {
  private store = inject(Store<{ skills: ISkillsState }>);

  public skills = toSignal(
    this.store.select(SkillsSelectors.skillsSelector),
    { initialValue: [] }
  );
  public isLoading = toSignal(this.store.select(SkillsSelectors.isLoadingSkillsSelector), { initialValue: true });
  public hasError = toSignal(this.store.select(SkillsSelectors.hasErrorSkillsSelector), { initialValue: false });
  public errorMessage = toSignal(this.store.select(SkillsSelectors.errorMessageSkillsSelector), { initialValue: '' });


  ngOnInit(): void {
    this.store.dispatch(SkillsActions.getSkills());
  }


  retryLoad(): void {
    this.store.dispatch(SkillsActions.getSkills());
  }
}
