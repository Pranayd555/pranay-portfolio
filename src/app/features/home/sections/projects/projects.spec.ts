import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Projects } from './projects';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { IProjectsState } from './types/projectsState.model';
import * as ProjectsSelectors from './store/selectors';
import * as ProjectsActions from './store/actions';
import { Dialog } from '@angular/cdk/dialog';
import { ProjDesModal } from './proj-des-modal/proj-des-modal';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('Projects', () => {
  let component: Projects;
  let fixture: ComponentFixture<Projects>;
  let store: MockStore;
  let mockDialog = { open: vi.fn() };

  const fakeElement = {
    getBoundingClientRect: vi.fn().mockReturnValue({
      top: 10,
      left: 20,
      width: 300,
      height: 200,
      bottom: 210,
      right: 320,
      x: 20,
      y: 10,
      toJSON: () => { }
    }),
  } as unknown as HTMLElement;

  const event = {
    stopPropagation: vi.fn(),
    currentTarget: fakeElement,
  } as unknown as Event;

  const mockProject = {
    id: 'string',
    title: 'string',
    description: 'string',
    icon: 'string',
    technologies: ['string'],
    links: {
      liveDemo: 'string',
      sourceCode: 'string'
    },
    featured: true
  } as any;

  const initialState: { projects: IProjectsState } = {
    projects: {
      projects: [],
      isLoading: true,
      hasError: false,
      errorMessage: ''
    }
  };

  beforeEach(async () => {
    mockDialog.open.mockClear();
    await TestBed.configureTestingModule({
      imports: [Projects],
      providers: [
        provideMockStore({
          initialState,
          selectors: [
            { selector: ProjectsSelectors.isProjectsIsLoadingSelector, value: true },
            { selector: ProjectsSelectors.isProjectsHasErrorSelector, value: false },
            { selector: ProjectsSelectors.getProjectsErrorMessageSelector, value: '' },
            { selector: ProjectsSelectors.getProjectsSelector, value: [] },
          ]
        }),
        { provide: Dialog, useValue: mockDialog }
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(Projects);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch getProjects on ngOnInit', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.ngOnInit();
    expect(dispatchSpy).toHaveBeenCalledWith(ProjectsActions.getProjects());
  });

  it('should dispatch getProjects on retryLoad()', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.retryLoad();
    expect(dispatchSpy).toHaveBeenCalledWith(ProjectsActions.getProjects());
  });

  it('should expose selector values as signals', () => {
    expect(component.isLoading()).toBe(true);
    expect(component.hasError()).toBe(false);
    expect(component.errorMessage()).toBe('');
    expect(component.projects()).toEqual([]);
  });

  it('should open modal when openModal is called', () => {
    component.openModal(event, mockProject);

    expect(mockDialog.open).toHaveBeenCalledWith(
      ProjDesModal,
      {
        data: { projectId: mockProject.id, rect: expect.any(Object) },
        panelClass: 'project-modal-panel',
        disableClose: true,
        hasBackdrop: true,
      }
    );
  });
});
