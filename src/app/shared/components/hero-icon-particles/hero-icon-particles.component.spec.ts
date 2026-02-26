import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { HeroIconParticlesComponent } from './hero-icon-particles.component';

describe('HeroIconParticlesComponent', () => {
  it('should create in server platform (SSR-safe)', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroIconParticlesComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    }).compileComponents();

    const fixture = TestBed.createComponent(HeroIconParticlesComponent);
    expect(fixture.componentInstance).toBeTruthy();
    fixture.destroy();
  });

  it('should call cleanup on destroy', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroIconParticlesComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    }).compileComponents();

    const fixture = TestBed.createComponent(HeroIconParticlesComponent);
    const component = fixture.componentInstance;
    const spy = vi.spyOn(component as any, 'cleanup');

    fixture.destroy();
    expect(spy).toHaveBeenCalled();
  });

  it('onResize should size to canvas rect (not window)', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroIconParticlesComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    }).compileComponents();

    const fixture = TestBed.createComponent(HeroIconParticlesComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance as any;
    component.platformId = 'browser';

    const canvas: HTMLCanvasElement = fixture.nativeElement.querySelector('canvas');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      width: 320,
      height: 200,
      top: 0,
      left: 0,
      bottom: 200,
      right: 320,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as any);

    const setSize = vi.fn();
    const setPixelRatio = vi.fn();
    component.renderer = { setSize, setPixelRatio } as any;
    component.camera = {
      aspect: 1,
      updateProjectionMatrix: vi.fn(),
    } as any;

    component.onResize();

    expect(setSize).toHaveBeenCalledWith(320, 200);
    expect(component.camera.aspect).toBeCloseTo(320 / 200);

    fixture.destroy();
  });

  it('should update ring rotation while dragging', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroIconParticlesComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    }).compileComponents();

    const fixture = TestBed.createComponent(HeroIconParticlesComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance as any;
    component.platformId = 'browser';

    component.ringGroup = { rotation: { y: 0 } };
    component.attachPointerControls();

    const EventCtor: any = (window as any).PointerEvent ?? (window as any).MouseEvent;
    const down = new EventCtor('pointerdown', {
      pointerId: 1,
      isPrimary: true,
      clientX: 200,
      clientY: 20,
    });
    document.dispatchEvent(down);

    const move = new EventCtor('pointermove', {
      pointerId: 1,
      isPrimary: true,
      clientX: 260,
      clientY: 20,
    });
    document.dispatchEvent(move);

    expect(component.ringGroup.rotation.y).not.toBe(0);

    const up = new EventCtor('pointerup', {
      pointerId: 1,
      isPrimary: true,
      clientX: 260,
      clientY: 20,
    });
    document.dispatchEvent(up);

    fixture.destroy();
  });
});

