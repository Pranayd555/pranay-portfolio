import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeService } from '../../../core/services/theme.service';
import { TextScrapperAnimation } from './text-scrapper-animation';

const mockWebGLContext = {
  getExtension: vi.fn(() => null),
  getParameter: vi.fn((param: number) => {
    if (param === 0x8b4d) return 16; // MAX_VERTEX_UNIFORM_VECTORS
    if (param === 0x8869) return 8;  // MAX_VERTEX_ATTRIBS
    return 0;
  }),
  getShaderPrecisionFormat: vi.fn(() => ({ rangeMin: 127, rangeMax: 127, precision: 23 })),
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
  canvas: { width: 800, height: 600 },
  drawingBufferWidth: 800,
  drawingBufferHeight: 600,
};

describe('TextScrapperAnimation', () => {
  let component: TextScrapperAnimation;
  let fixture: ComponentFixture<TextScrapperAnimation>;

  beforeEach(async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((type: any) => {
      if (type === 'webgl' || type === 'webgl2') return mockWebGLContext as any;
      // SVG sampling uses offscreen 2D canvas; jsdom doesn't implement it by default.
      return null;
    });

    vi.stubGlobal('fetch', vi.fn(async () => ({
      text: async () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0 H10 V10 H0 Z"/></svg>`,
    })) as any);

    const mockThemeService = { darkMode: signal(true) };

    await TestBed.configureTestingModule({
      imports: [TextScrapperAnimation],
      providers: [
        { provide: ThemeService, useValue: mockThemeService },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TextScrapperAnimation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a canvas element', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('canvas')).toBeTruthy();
  });

  it('should call cleanup on destroy', () => {
    const cleanupSpy = vi.spyOn(component as any, 'cleanup');
    fixture.destroy();
    expect(cleanupSpy).toHaveBeenCalled();
  });

  it('should cancel animation frame on cleanup', () => {
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');
    (component as any).animationFrameId = 42;
    (component as any).cleanup();
    expect(cancelSpy).toHaveBeenCalledWith(42);
  });
});
