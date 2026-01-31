import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Experience } from './experience';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import * as ExperienceSelectors from './store/selectors';
import * as ExperienceActions from './store/actions';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Experience', () => {
  let component: Experience;
  let fixture: ComponentFixture<Experience>;
  let store: MockStore;

  const initialState = {
    experience: {
      experience: [],
      isLoading: true,
      hasError: false,
      errorMessage: ''
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Experience],
      providers: [
        provideMockStore({
          initialState,
          selectors: [
            { selector: ExperienceSelectors.experienceSelector, value: [] },
            { selector: ExperienceSelectors.experienceIsLoadingSelector, value: true },
            { selector: ExperienceSelectors.experienceHasErrorSelector, value: false },
            { selector: ExperienceSelectors.experienceErrorMessageSelector, value: '' },
          ]
        })
      ]
    })
      .compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(Experience);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch getExperience on ngOnInit', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.ngOnInit();
    expect(dispatchSpy).toHaveBeenCalledWith(ExperienceActions.getExperience());
  });

  it('should set card animation on card click', () => {
    const animationSpy = vi.spyOn(component, 'getAnimationClass');
    expect(component.cardClickedValue()).toBe(false);
    component.cardClicked(0, true);
    expect(component.cardClickedValue()).toBe(true);
    expect(animationSpy).toHaveBeenCalledWith(0, true)
  })
});
