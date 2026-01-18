import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IExperience } from './types/experience.model';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import * as ExperienceSelectors from './store/selectors';
import { getExperience } from './store/actions';

@Component({
  selector: 'app-experience',
  imports: [CommonModule],
  templateUrl: './experience.html',
  styleUrl: './experience.css',
})
export class Experience implements OnInit {

  private store = inject(Store<{ experience: IExperience[] }>);

  public isLoading = toSignal(this.store.select(ExperienceSelectors.experienceIsLoadingSelector), {
    initialValue: true
  });

  public hasError = toSignal(this.store.select(ExperienceSelectors.experienceHasErrorSelector), {
    initialValue: false
  })

  public errorMessage = toSignal(this.store.select(ExperienceSelectors.experienceErrorMessageSelector), {
    initialValue: ''
  })

  public experiences = toSignal(this.store.select(ExperienceSelectors.experienceSelector), {
    initialValue: []
  })



  ngOnInit(): void {
    this.store.dispatch(getExperience())
  }


  retryLoad(): void {
    this.store.dispatch(getExperience())
  }

  // Helper method to format period display
  formatPeriod(period: { start: string; end: string }): string {
    return `${period.start} - ${period.end}`;
  }
}
