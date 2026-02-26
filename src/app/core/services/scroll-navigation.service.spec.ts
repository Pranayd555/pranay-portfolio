import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ScrollNavigationService } from './scroll-navigation.service';

describe('ScrollNavigationService', () => {
  let service: ScrollNavigationService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScrollNavigationService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start at slide 0', () => {
    expect(service.currentSlide()).toBe(0);
  });

  it('should expose 5 slides', () => {
    expect(service.TOTAL_SLIDES).toBe(5);
    expect(service.slides.length).toBe(5);
  });

  it('should advance to next slide', () => {
    service.next();
    expect(service.currentSlide()).toBe(1);
  });

  it('should not go below slide 0 on prev()', () => {
    service.prev();
    expect(service.currentSlide()).toBe(0);
  });

  it('should not exceed last slide on next()', () => {
    for (let i = 0; i < 10; i++) {
      vi.advanceTimersByTime(1000);
      service.next();
    }
    expect(service.currentSlide()).toBe(4);
  });

  it('should lock navigation during debounce period', () => {
    service.next();
    service.next(); // should be ignored due to lock
    expect(service.currentSlide()).toBe(1);
  });

  it('should allow navigation after lock expires', () => {
    service.next();
    vi.advanceTimersByTime(900);
    service.next();
    expect(service.currentSlide()).toBe(2);
  });

  it('should goTo a specific slide', () => {
    service.goTo(3);
    expect(service.currentSlide()).toBe(3);
  });

  it('should ignore goTo out-of-bounds index', () => {
    service.goTo(-1);
    expect(service.currentSlide()).toBe(0);

    vi.advanceTimersByTime(1000);
    service.goTo(99);
    expect(service.currentSlide()).toBe(0);
  });

  it('should reset to first slide', () => {
    service.goTo(4);
    vi.advanceTimersByTime(1000);
    service.resetToFirst();
    expect(service.currentSlide()).toBe(0);
  });

  it('should have correct route for each slide', () => {
    expect(service.slides[0].route).toBeNull();
    expect(service.slides[1].route).toBe('/about');
    expect(service.slides[2].route).toBe('/projects');
    expect(service.slides[3].route).toBe('/experience');
    expect(service.slides[4].route).toBe('/contact');
  });
});
