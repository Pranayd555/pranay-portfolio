import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SlideParticleBgComponent } from './slide-particle-bg.component';

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

describe('SlideParticleBgComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlideParticleBgComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SlideParticleBgComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should call cleanup on destroy', () => {
    const fixture = TestBed.createComponent(SlideParticleBgComponent);
    const cleanupSpy = vi.spyOn(fixture.componentInstance as any, 'cleanup');
    fixture.destroy();
    expect(cleanupSpy).toHaveBeenCalled();
  });

  it('should cancel animation frame on cleanup', () => {
    const fixture = TestBed.createComponent(SlideParticleBgComponent);
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');
    const instance = fixture.componentInstance as any;
    instance.animationFrameId = 42;
    instance.cleanup();
    expect(cancelSpy).toHaveBeenCalledWith(42);
  });
});
