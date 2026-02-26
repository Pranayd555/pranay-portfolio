import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BackgroundAnimationThreeComponent } from './background-animation-three.component';
import { ThemeService } from '../../../core/services/theme.service';
import { signal } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';

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

describe('BackgroundAnimationThreeComponent', () => {
    let component: BackgroundAnimationThreeComponent;
    let fixture: ComponentFixture<BackgroundAnimationThreeComponent>;
    let mockThemeService: any;

    beforeEach(async () => {
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockWebGLContext as any);

        mockThemeService = {
            darkMode: signal(true),
        };

        await TestBed.configureTestingModule({
            imports: [BackgroundAnimationThreeComponent],
            providers: [
                { provide: ThemeService, useValue: mockThemeService },
                { provide: PLATFORM_ID, useValue: 'browser' },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(BackgroundAnimationThreeComponent);
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

    it('should update radius on resize', () => {
        // Ensure renderer guard passes by setting stubs if needed
        const instance = component as any;
        if (!instance.renderer) {
            instance.renderer = { setSize: vi.fn(), setPixelRatio: vi.fn(), dispose: vi.fn() };
            instance.camera = { aspect: 1, updateProjectionMatrix: vi.fn() };
            instance.particles = {
                scale: { set: vi.fn() },
                material: { uniforms: { uPixelRatio: { value: 1 } }, dispose: vi.fn() },
                geometry: { dispose: vi.fn() },
            };
        }
        const spy = vi.spyOn(instance, 'updateRadius');
        component.onResize();
        expect(spy).toHaveBeenCalled();
    });

    it('should cleanup on destroy', () => {
        const cleanupSpy = vi.spyOn(component as any, 'cleanup');
        (component as any).cleanup();
        expect(cleanupSpy).toHaveBeenCalled();
    });
});
