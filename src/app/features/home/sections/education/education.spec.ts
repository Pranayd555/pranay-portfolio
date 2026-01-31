import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Education } from './education';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import * as EducationSelectors from './store/selectors';
import * as EducationActions from './store/actions';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Education', () => {
  let component: Education;
  let fixture: ComponentFixture<Education>;
  let store: MockStore;

  const initialState = {
    education: {
      education: { education: [], certifications: [] },
      isLoading: true,
      hasError: false,
      errorMessage: ''
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Education],
      providers: [
        provideMockStore({
          initialState,
          selectors: [
            { selector: EducationSelectors.educationSelector, value: { education: [], certifications: [] } },
            { selector: EducationSelectors.educationIsLoadingSelector, value: true },
            { selector: EducationSelectors.educationHasErrorSelector, value: false },
            { selector: EducationSelectors.educationErrorMessageSelector, value: '' },
          ]
        })
      ]
    })
      .compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(Education);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch getEducation on ngOnInit', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.ngOnInit();
    expect(dispatchSpy).toHaveBeenCalledWith(EducationActions.getEducation());
  });
});
