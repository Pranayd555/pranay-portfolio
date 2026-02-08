import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IEducationState } from './types/educationState.model';
import { Store } from '@ngrx/store';
import * as EducationSelectors from './store/selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { getEducation } from './store/actions';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './education.html',
  styleUrl: './education.css',
})
export class Education implements OnInit {
  private store = inject(Store<{ education: IEducationState }>)

  public isLoading = toSignal(this.store.select(EducationSelectors.educationIsLoadingSelector), {
    initialValue: true,
  })

  public hasError = toSignal(this.store.select(EducationSelectors.educationHasErrorSelector), {
    initialValue: false
  })

  public errorMessage = toSignal(this.store.select(EducationSelectors.educationErrorMessageSelector), {
    initialValue: ''
  })

  public educationSectionData = toSignal(this.store.select(EducationSelectors.educationSelector), {
    initialValue: {
      education: [],
      certifications: []
    }
  })


  educationData = computed(() => this.educationSectionData()?.education || []);
  certificationData = computed(() => this.educationSectionData()?.certifications || []);

  ngOnInit(): void {
    this.store.dispatch(getEducation())
  }



  retryLoad(): void {
    this.store.dispatch(getEducation())
  }
}
