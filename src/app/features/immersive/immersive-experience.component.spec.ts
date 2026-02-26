import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { ImmersiveExperienceComponent } from './immersive-experience.component';
import { ScrollNavigationService } from '../../core/services/scroll-navigation.service';

const mockWebGLContext = {
  getExtension: vi.fn(() => null),
  getParameter: vi.fn(() => 0),
  createBuffer: vi.fn(() => ({})),
  bindBuffer: vi.fn(),
  bufferData: vi.fn(),
  enable: vi.fn(),
  disable: vi.fn(),
  viewport: vi.fn(),
  clear: vi.fn(),
  clearColor: vi.fn(),
  useProgram: vi.fn(),
  createProgram: vi.fn(() => ({})),
  createShader: vi.fn(() => ({})),
  shaderSource: vi.fn(),
  compileShader: vi.fn(),
  attachShader: vi.fn(),
  linkProgram: vi.fn(),
  getProgramParameter: vi.fn(() => true),
  getShaderParameter: vi.fn(() => true),
  drawArrays: vi.fn(),
  drawElements: vi.fn(),
  createTexture: vi.fn(() => ({})),
  bindTexture: vi.fn(),
  texImage2D: vi.fn(),
  texParameteri: vi.fn(),
  generateMipmap: vi.fn(),
  activeTexture: vi.fn(),
  uniform1i: vi.fn(),
  uniform1f: vi.fn(),
  uniform3fv: vi.fn(),
  uniformMatrix4fv: vi.fn(),
  createVertexArray: vi.fn(() => ({})),
  bindVertexArray: vi.fn(),
  enableVertexAttribArray: vi.fn(),
  vertexAttribPointer: vi.fn(),
  getAttribLocation: vi.fn(() => 0),
  getUniformLocation: vi.fn(() => ({})),
  deleteBuffer: vi.fn(),
  deleteShader: vi.fn(),
  deleteProgram: vi.fn(),
  deleteTexture: vi.fn(),
  isContextLost: vi.fn(() => false),
};

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockWebGLContext as any);
});

describe('ImmersiveExperienceComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImmersiveExperienceComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ImmersiveExperienceComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should reset to first slide on init', () => {
    const navService = TestBed.inject(ScrollNavigationService);
    navService.goTo(3);

    const fixture = TestBed.createComponent(ImmersiveExperienceComponent);
    fixture.detectChanges();

    expect(navService.currentSlide()).toBe(0);
  });

  it('should show hero slide on slide 0', () => {
    const fixture = TestBed.createComponent(ImmersiveExperienceComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('app-hero-slide')).toBeTruthy();
  });

  it('should remove event listeners on destroy', () => {
    const fixture = TestBed.createComponent(ImmersiveExperienceComponent);
    fixture.detectChanges();

    const removeSpy = vi.spyOn(
      fixture.componentInstance['el'].nativeElement,
      'removeEventListener'
    );
    fixture.destroy();
    expect(removeSpy).toHaveBeenCalledWith('wheel', expect.any(Function));
  });
});
