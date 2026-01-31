import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjDesModal } from './proj-des-modal';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import * as ProjectDetailsActions from './store/actions';

describe('ProjDesModal', () => {
  let component: ProjDesModal;
  let fixture: ComponentFixture<ProjDesModal>;
  let store: MockStore;

  const mockDialogRef = {
    close: vi.fn()
  };

  const mockData = {
    projectId: '1',
    rect: {
      top: 0,
      left: 0,
      width: 100,
      height: 100
    }
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    mockDialogRef.close.mockClear();

    // Mock Element.prototype.animate as it's not available in JSDOM
    if (!Element.prototype.animate) {
      Element.prototype.animate = vi.fn().mockImplementation(() => ({
        onfinish: null,
        play: vi.fn(),
        pause: vi.fn(),
        cancel: vi.fn(),
        finished: Promise.resolve()
      }));
    }

    // Mock requestAnimationFrame
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => setTimeout(cb, 0));

    await TestBed.configureTestingModule({
      imports: [ProjDesModal],
      providers: [
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: DIALOG_DATA, useValue: mockData },
        provideMockStore({
          initialState: {
            projectDetails: {
              project: null,
              isLoading: false,
              hasError: false,
              errorMessage: ''
            }
          }
        })
      ]
    })
      .compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(ProjDesModal);
    component = fixture.componentInstance;

    // Mock the modal element
    const mockAnimate = vi.fn().mockImplementation(() => {
      const anim = {
        onfinish: null as any,
      };
      // We will trigger this manually in tests that need it
      return anim;
    });

    component.modal = {
      nativeElement: {
        getBoundingClientRect: () => ({
          top: 0,
          left: 0,
          width: 500,
          height: 500,
          bottom: 500,
          right: 500
        }),
        animate: mockAnimate,
        style: {}
      }
    } as any;

    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch getProjectById on ngOnInit', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.ngOnInit();
    expect(dispatchSpy).toHaveBeenCalledWith(ProjectDetailsActions.getProjectById({ projectId: '1' }));
  });

  it('should expose selector values as signals', () => {
    expect(component.isLoading()).toBe(false);
    expect(component.hasError()).toBe(false);
    expect(component.errorMessage()).toBe('');
    expect(component.project()).toBeNull();
  });

  it('should dispatch getProjectById on retryLoad()', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.retryLoad();
    expect(dispatchSpy).toHaveBeenCalledWith(ProjectDetailsActions.getProjectById({ projectId: '1' }));
  });

  it('should close modal when close() is called', () => {
    // Capture the animation object created during close()
    let animationObj: any;
    (component.modal.nativeElement.animate as any).mockImplementation(() => {
      animationObj = { onfinish: null };
      return animationObj;
    });

    component.close();

    // Manually trigger onfinish
    if (animationObj && animationObj.onfinish) {
      animationObj.onfinish();
    }

    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should get sanitized URL', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const sanitizedUrl = component.getSanitizedUrl(url);
    expect(sanitizedUrl).toBeDefined();
  });
});
