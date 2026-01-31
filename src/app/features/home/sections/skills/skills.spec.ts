import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Skills } from './skills';
import * as SkillsActions from './store/actions';
import * as SkillsSelectors from './store/selectors';
import { ISkillsState } from './types/skilsState.model';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Skills Component', () => {
  let component: Skills;
  let fixture: ComponentFixture<Skills>;
  let store: MockStore;

  const initialState: { skills: ISkillsState } = {
    skills: {
      skills: [],
      isLoading: true,
      hasError: false,
      errorMessage: '',
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Skills], // standalone component
      providers: [
        provideMockStore({
          initialState,
          selectors: [
            {
              selector: SkillsSelectors.skillsSelector,
              value: [],
            },
            {
              selector: SkillsSelectors.isLoadingSkillsSelector,
              value: true,
            },
            {
              selector: SkillsSelectors.hasErrorSkillsSelector,
              value: false,
            },
            {
              selector: SkillsSelectors.errorMessageSkillsSelector,
              value: '',
            },
          ],
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(Skills);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch getSkills on ngOnInit', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    component.ngOnInit();

    expect(dispatchSpy).toHaveBeenCalledWith(
      SkillsActions.getSkills()
    );
  });

  it('should dispatch getSkills on retryLoad()', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    component.retryLoad();

    expect(dispatchSpy).toHaveBeenCalledWith(
      SkillsActions.getSkills()
    );
  });

  it('should expose selector values as signals', () => {
    expect(component.skills()).toEqual([]);
    expect(component.isLoading()).toBe(true);
    expect(component.hasError()).toBe(false);
    expect(component.errorMessage()).toBe('');
  });
});
