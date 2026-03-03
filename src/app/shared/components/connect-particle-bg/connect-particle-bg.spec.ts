import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConnectParticleBg } from './connect-particle-bg';

const mockWebGLContext = {
  getExtension: vi.fn(() => null),
  getParameter: vi.fn((param: number) => {
    if (param === 0x8b4d) return 16;
    if (param === 0x8869) return 8;
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
  uniform2f: vi.fn(),
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

describe('ConnectParticleBg', () => {
  let component: ConnectParticleBg;
  let fixture: ComponentFixture<ConnectParticleBg>;

  beforeEach(async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockWebGLContext as unknown as GPUCanvasContext);

    await TestBed.configureTestingModule({
      imports: [ConnectParticleBg],
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    }).compileComponents();

    fixture = TestBed.createComponent(ConnectParticleBg);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call cleanup on destroy', () => {
    const spy = vi.spyOn(component as unknown as { cleanup: () => void }, 'cleanup');
    fixture.destroy();
    expect(spy).toHaveBeenCalled();
  });

  it('should cancel animation frame on destroy', () => {
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');
    (component as unknown as { animationFrameId: number }).animationFrameId = 42;
    (component as unknown as { cleanup: () => void }).cleanup();
    expect(cancelSpy).toHaveBeenCalledWith(42);
  });
});
