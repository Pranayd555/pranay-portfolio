import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  afterNextRender,
  effect,
  inject,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-slide-particle-bg',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:resize)': 'onResize()' },
  template: `<canvas #canvas class="absolute inset-0 w-full h-full"></canvas>`,
  styles: [`
    :host { display: block; position: absolute; inset: 0; pointer-events: none; }
  `],
})
export class SlideParticleBgComponent implements OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private themeService = inject(ThemeService);

  private scene?: THREE.Scene;
  private camera?: THREE.OrthographicCamera;
  private renderer?: THREE.WebGLRenderer;
  private particles?: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;

  private positions?: Float32Array;
  private speeds?: Float32Array;
  private animationFrameId?: number;
  private timer?: THREE.Timer;

  private removePointerListener?: () => void;
  private pendingPointer?: { x: number; y: number };
  private pointerInside = false;

  private readonly COUNT = 480; // keep <= 500 for mobile GPU safety
  private readonly BASE_SIZE_PX = 3.4;
  private readonly HOVER_RADIUS_NDC = 0.22;
  private readonly SPEED_MIN = 0.08;
  private readonly SPEED_MAX = 2;

  constructor() {
    effect(() => {
      const isDark = this.themeService.darkMode();
      const material = this.particles?.material;
      if (!material) return;

      material.uniforms['uIsDark'].value = isDark ? 1.0 : 0.0;
      material.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;

      const color = isDark ? new THREE.Color(0x00f3ff) : new THREE.Color(0x135bec);
      material.uniforms['uColor'].value.copy(color);
    });

    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      if (!this.canvasRef?.nativeElement) return;

      this.initThree();
      this.attachPointerTracking();
      this.animate();
    });

    this.destroyRef.onDestroy(() => this.cleanup());
  }

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;

    this.scene = new THREE.Scene();

    const { width, height, aspect } = this.getCanvasMetrics();
    const viewHalfHeight = 1;
    const viewHalfWidth = viewHalfHeight * aspect;

    this.camera = new THREE.OrthographicCamera(
      -viewHalfWidth,
      viewHalfWidth,
      viewHalfHeight,
      -viewHalfHeight,
      0.1,
      10
    );
    this.camera.position.z = 2;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.timer = new THREE.Timer();
    this.timer.connect(this.document);

    const geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.COUNT * 3);
    this.speeds = new Float32Array(this.COUNT);
    const seeds = new Float32Array(this.COUNT);

    for (let i = 0; i < this.COUNT; i++) {
      const i3 = i * 3;
      this.positions[i3] = this.rand(-viewHalfWidth, viewHalfWidth);
      this.positions[i3 + 1] = this.rand(-viewHalfHeight, viewHalfHeight);
      this.positions[i3 + 2] = 0;
      this.speeds[i] = this.rand(this.SPEED_MIN, this.SPEED_MAX);
      seeds[i] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

    const isDark = this.themeService.darkMode();
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(isDark ? 0x00f3ff : 0x135bec) },
        uIsDark: { value: isDark ? 1.0 : 0.0 },
        uMouse: { value: new THREE.Vector2(999, 999) },
        uHoverRadius: { value: this.HOVER_RADIUS_NDC },
        uBaseSize: { value: this.BASE_SIZE_PX },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uHoverRadius;
        uniform float uBaseSize;
        uniform float uPixelRatio;

        attribute float aSeed;

        varying float vHover;
        varying float vPulse;

        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          vec2 ndc = gl_Position.xy / gl_Position.w;
          float dist = distance(ndc, uMouse);
          float hover = smoothstep(uHoverRadius, 0.0, dist);

          float pulse = sin(uTime * 1.2 + aSeed * 6.2831) * 0.5 + 0.5;

          float size = uBaseSize * (0.9 + pulse * 0.6);
          size *= (1.0 + hover * 1.9);

          gl_PointSize = min(size * uPixelRatio, 48.0);
          vHover = hover;
          vPulse = pulse;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uIsDark;

        varying float vHover;
        varying float vPulse;

        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;

          float core = smoothstep(0.16, 0.0, d);
          float halo = smoothstep(0.5, 0.14, d);

          float glowBoost = 0.55 + vHover * 1.15;
          float pulseBoost = 0.85 + vPulse * 0.15;

          vec3 highlight = mix(uColor, vec3(1.0), (uIsDark > 0.5) ? 0.55 : 0.25);
          vec3 color = mix(uColor, highlight, core);

          float alphaBase = (uIsDark > 0.5) ? (halo * 0.35 + core * 0.75) : (halo * 0.45 + core * 0.85);
          float alpha = alphaBase * glowBoost * pulseBoost;

          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  private attachPointerTracking(): void {
    if (this.removePointerListener) return;

    const onPointerMove = (ev: PointerEvent): void => {
      const canvas = this.canvasRef?.nativeElement;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();

      const inside =
        ev.clientX >= rect.left &&
        ev.clientX <= rect.right &&
        ev.clientY >= rect.top &&
        ev.clientY <= rect.bottom;

      this.pointerInside = inside;
      if (!inside) return;

      this.pendingPointer = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
    };

    const doc = this.document;
    doc.addEventListener('pointermove', onPointerMove, { passive: true });

    this.removePointerListener = () => doc.removeEventListener('pointermove', onPointerMove);
  }

  private animate(): void {
    if (!this.renderer || !this.scene || !this.camera || !this.particles || !this.positions || !this.speeds || !this.timer) return;
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    this.timer.update();
    const dt = Math.min(this.timer.getDelta(), 0.05);
    const elapsed = this.timer.getElapsed();

    const { aspect } = this.getCanvasMetrics();
    const viewHalfHeight = 1;
    const viewHalfWidth = viewHalfHeight * aspect;

    for (let i = 0; i < this.COUNT; i++) {
      const i3 = i * 3;
      this.positions[i3] += this.speeds[i] * dt;
      if (this.positions[i3] > viewHalfWidth + 0.05) {
        this.positions[i3] = -viewHalfWidth - 0.05;
        this.positions[i3 + 1] = this.rand(-viewHalfHeight, viewHalfHeight);
      }
    }

    const positionAttr = this.particles.geometry.getAttribute('position') as THREE.BufferAttribute;
    positionAttr.needsUpdate = true;

    const material = this.particles.material;
    material.uniforms['uTime'].value = elapsed;

    const mouse = material.uniforms['uMouse'].value as THREE.Vector2;
    if (this.pointerInside && this.pendingPointer) {
      const { width, height } = this.getCanvasMetrics();
      mouse.x = (this.pendingPointer.x / width) * 2 - 1;
      mouse.y = -((this.pendingPointer.y / height) * 2 - 1);
    } else {
      mouse.set(999, 999);
    }

    this.renderer.render(this.scene, this.camera);
  }

  private getCanvasMetrics(): { width: number; height: number; aspect: number } {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width || canvas.clientWidth || 1));
    const height = Math.max(1, Math.floor(rect.height || canvas.clientHeight || 1));
    return { width, height, aspect: width / height };
  }

  private rand(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  onResize(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.renderer || !this.camera || !this.particles) return;

    const { width, height, aspect } = this.getCanvasMetrics();
    const viewHalfHeight = 1;
    const viewHalfWidth = viewHalfHeight * aspect;

    this.camera.left = -viewHalfWidth;
    this.camera.right = viewHalfWidth;
    this.camera.top = viewHalfHeight;
    this.camera.bottom = -viewHalfHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.particles.material.uniforms['uPixelRatio'].value = Math.min(window.devicePixelRatio, 2);
  }

  private cleanup(): void {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.removePointerListener?.();
    this.removePointerListener = undefined;

    this.timer?.dispose();
    this.timer = undefined;

    if (this.renderer) this.renderer.dispose();
    if (this.particles) {
      this.particles.geometry.dispose();
      (this.particles.material as THREE.Material).dispose();
    }
    this.scene?.clear();

    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this.particles = undefined;
    this.positions = undefined;
    this.speeds = undefined;
    this.pendingPointer = undefined;
    this.pointerInside = false;
  }

  ngOnDestroy(): void {}
}
