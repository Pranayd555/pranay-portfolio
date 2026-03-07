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

  it('onResize should update camera aspect and renderer size from canvas metrics', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroIconParticlesComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    }).compileComponents();

    const fixture = TestBed.createComponent(HeroIconParticlesComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance as any;
    component.platformId = 'browser';

    const setSize = vi.fn();
    const setPixelRatio = vi.fn();
    component.renderer = { setSize, setPixelRatio, dispose: vi.fn() } as any;
    component.camera = {
      aspect: 1,
      updateProjectionMatrix: vi.fn(),
    } as any;

    component.onResize();

    const [width, height] = [1, 1];
    expect(setSize).toHaveBeenCalledWith(width, height, false);
    expect(component.camera.aspect).toBe(width / height);
    expect(setPixelRatio).toHaveBeenCalled();

    fixture.destroy();
  });
});

