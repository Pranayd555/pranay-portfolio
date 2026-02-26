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
      far: 0,
      position: { z: 0 },
      updateProjectionMatrix: vi.fn(),
    } as any;

    const spriteScaleSet = vi.fn();
    component.iconSprites = [
      {
        sprite: { scale: { set: spriteScaleSet } } as any,
        orbitRadiusFactor: 0.3,
        orbitRadius: 0,
        orbitSpeed: 0,
        orbitPhase: 0,
        bobPhase: 0,
        bobAmplitudeFactor: 0.05,
        bobAmplitude: 0,
        tiltX: 0,
        tiltZ: 0,
      },
    ];

    component.onResize();

    expect(setSize).toHaveBeenCalledWith(320, 200);
    expect(component.camera.aspect).toBeCloseTo(320 / 200);
    expect(spriteScaleSet).toHaveBeenCalled();

    fixture.destroy();
  });
});

