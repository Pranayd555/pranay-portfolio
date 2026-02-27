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

const ABOUT_VERTEX_SHADER = `
uniform float uTime;
uniform vec2 uMouse;
uniform float uHoverRadius;
uniform float uBaseSize;
uniform float uPixelRatio;
uniform float uDepth;

attribute float aRandom;

varying float vHover;
varying float vAlpha;
varying float vGlow;

float hash(float n) { return fract(sin(n) * 43758.5453123); }

void main() {
  vec3 p = position;

  // Subtle wave wobble to keep motion organic (no CPU allocations).
  float seed = aRandom;
  float t = uTime;
  p.x += sin(t * 0.9 + seed * 4.2831 + p.y * 0.45) * 0.025;
  p.y += cos(t * 0.8 + seed * 9.0    + p.x * 0.40) * 0.025;

  vec4 mvPosition = modelViewMatrix * vec4(p, 1.2);
  gl_Position = projectionMatrix * mvPosition;

  vec2 ndc = gl_Position.xy / gl_Position.w;
  float dist = distance(ndc, uMouse);
  float hover = smoothstep(uHoverRadius, 0.0, dist);

  // Scale point size relative to our configured depth range
  // so particles remain visible even when far down -Z.
  float perspective = uDepth / max(0.001, -mvPosition.z);
  float pulse = sin(t * 1.1 + seed * 6.2831) * 0.5 + 0.5;

  float size = uBaseSize * (0.85 + pulse * 0.55);
  size *= (1.0 + hover * 1.7);
  gl_PointSize = min(size * uPixelRatio * perspective, 50.0);

  // Fade in/out by depth so z-wrap is visually continuous.
  float zNorm = clamp((p.z + uDepth) / uDepth, 0.0, 1.0); // -uDepth..0 => 0..1
  float fadeIn = smoothstep(0.02, 0.18, zNorm);
  float fadeOut = 1.0 - smoothstep(0.78, 1.0, zNorm);
  float alpha = fadeIn * fadeOut;

  vHover = hover;
  vAlpha = alpha;
  vGlow = 0.55 + pulse * 0.35 + hover * 0.75 + hash(seed * 2.3) * 0.12;
}
`;

const ABOUT_FRAGMENT_SHADER = `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uIsDark;

varying float vHover;
varying float vAlpha;
varying float vGlow;

void main() {
  float d = distance(gl_PointCoord, vec2(0.5));
  if (d > 0.5) discard;

  float core = smoothstep(0.18, 0.0, d);
  float halo = smoothstep(0.5, 0.14, d);

  vec3 base = mix(uColorA, uColorB, core);
  vec3 highlight = mix(base, vec3(1.0), (uIsDark > 0.5) ? 0.65 : 0.32);
  vec3 color = mix(base, highlight, core);

  float alphaBase = (uIsDark > 0.5)
    ? (halo * 0.30 + core * 0.70)
    : (halo * 0.45 + core * 0.80);

  float alpha = alphaBase * vGlow * (0.98 + vHover * 0.35) * vAlpha;
  alpha *= (uIsDark > 0.5) ? 1.35 : 1.15;
  gl_FragColor = vec4(color, alpha);
}
`;



@Component({
  selector: 'app-about-particle-bg',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:resize)': 'onResize()' },
  template: `<canvas #canvas class="absolute inset-0 w-full h-full"></canvas>`,
  styles: [`
    :host { display: block; position: absolute; inset: 0; pointer-events: none; }
  `],
})
export class AboutParticleBgComponent implements OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private themeService = inject(ThemeService);

  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private renderer?: THREE.WebGLRenderer;
  private particles?: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private positionAttr?: THREE.BufferAttribute;

  private positions?: Float32Array;
  private randomness?: Float32Array;
  private velX?: Float32Array;
  private velY?: Float32Array;
  private velZ?: Float32Array;

  private timer?: THREE.Timer;
  private mouse = new THREE.Vector2(999, 999);
  private animationFrameId?: number;
  private removePointerListener?: () => void;
  private pointerInside = false;
  private pendingPointer?: { x: number; y: number };

  private count = 0;
  private bounds = 10.0;
  private baseSizePx = 4.6;
  private hoverRadiusNdc = 1.22;
  private layoutBucket: 0 | 1 | 2 = 0;
  private viewAspect = 1;
  private depth = 9;
  private readonly ABOUT_COLOR = new THREE.Color(0xf3a000);
  private readonly ABOUT_COLOR_ACCENT = new THREE.Color(0xf3a000).offsetHSL(0.02, 0.08, 0.12);

  constructor() {
    effect(() => {
      const isDark = this.themeService.darkMode();
      const material = this.particles?.material;
      if (!material) return;

      material.uniforms['uIsDark'].value = isDark ? 1.0 : 0.0;

      (material.uniforms['uColorA'].value as THREE.Color).copy(this.ABOUT_COLOR);
      (material.uniforms['uColorB'].value as THREE.Color).copy(this.ABOUT_COLOR_ACCENT);

      material.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
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

    const { width, height, aspect } = this.getCanvasMetrics();
    this.applyLayoutForWidth(width);
    this.viewAspect = aspect;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(78, aspect, 0.1, 80);
    this.camera.position.z = 0;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.timer = new THREE.Timer();
    this.timer.connect(this.document);

    this.createParticles(this.desiredCountForWidth(width));
  }

  private desiredCountForWidth(width: number): number {
    // Keep mobile-safe (CPU-updated particles).
    if (width >= 1280) return 480;
    if (width >= 768) return 420;
    return 220;
  }

  private applyLayoutForWidth(width: number): void {
    if (width >= 1280) {
      this.bounds = 10.5;
      this.baseSizePx = 6.2;
      this.hoverRadiusNdc = 0.2;
      this.depth = 24;
      this.layoutBucket = 2;
      return;
    }

    if (width >= 768) {
      this.bounds = 8.8;
      this.baseSizePx = 5.2;
      this.hoverRadiusNdc = 0.21;
      this.depth = 22;
      this.layoutBucket = 1;
      return;
    }

    this.bounds = 7.2;
    this.baseSizePx = 4.6;
    this.hoverRadiusNdc = 0.22;
    this.depth = 18;
    this.layoutBucket = 0;
  }

  private getLayoutBucketForWidth(width: number): 0 | 1 | 2 {
    if (width >= 1280) return 2;
    if (width >= 768) return 1;
    return 0;
  }

  private updateLayoutForWidth(width: number): boolean {
    const next = this.getLayoutBucketForWidth(width);
    if (next === this.layoutBucket) return false;
    this.applyLayoutForWidth(width);
    return true;
  }

  private disposeParticles(): void {
    if (!this.scene || !this.particles) return;

    this.scene.remove(this.particles);
    this.particles.geometry.dispose();
    (this.particles.material as THREE.Material).dispose();

    this.particles = undefined;
    this.positionAttr = undefined;
    this.positions = undefined;
    this.randomness = undefined;
    this.velX = undefined;
    this.velY = undefined;
    this.velZ = undefined;
    this.count = 0;
  }

  private spawn(i: number, farZ: boolean): void {
    if (!this.positions || !this.randomness || !this.velX || !this.velY || !this.velZ) return;

    const i3 = i * 3;
    const seed = Math.random();

    // Random point in a disc, scaled to current bounds/aspect.
    const angle = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * (this.bounds * 0.55);
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;

    this.positions[i3] = x;
    this.positions[i3 + 1] = y;
    this.positions[i3 + 2] = farZ ? -(0.75 + Math.random() * 0.25) * this.depth : -(0.15 + Math.random() * 0.15) * this.depth;

    this.randomness[i] = seed;

    // Flow field: gentle drift + swirl around origin, plus forward movement.
    const drift = 0.35 + Math.random() * 0.85;
    const swirl = 0.55 + seed * 0.9;
    this.velX[i] = (-y * 0.12) * swirl + (Math.cos(seed * 12.3) * 0.18) * drift;
    this.velY[i] = ( x * 0.12) * swirl + (Math.sin(seed * 9.7) * 0.18) * drift;
    this.velZ[i] = 6.5 + Math.random() * 7.5;
  }

  private createParticles(count: number): void {
    if (!this.scene) return;
    this.disposeParticles();

    const geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(count * 3);
    this.randomness = new Float32Array(count);
    this.velX = new Float32Array(count);
    this.velY = new Float32Array(count);
    this.velZ = new Float32Array(count);
    this.count = count;

    for (let i = 0; i < count; i++) {
      this.spawn(i, true);
    }

    this.positionAttr = new THREE.BufferAttribute(this.positions, 3);
    geometry.setAttribute('position', this.positionAttr);
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(this.randomness, 1));

    const isDark = this.themeService.darkMode();
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: this.mouse },
        uHoverRadius: { value: this.hoverRadiusNdc },
        uBaseSize: { value: this.baseSizePx },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uDepth: { value: this.depth },
        uIsDark: { value: isDark ? 1.0 : 0.0 },
        uColorA: { value: this.ABOUT_COLOR.clone() },
        uColorB: { value: this.ABOUT_COLOR_ACCENT.clone() },
      },
      vertexShader: ABOUT_VERTEX_SHADER,
      fragmentShader: ABOUT_FRAGMENT_SHADER,
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
    if (
      !this.renderer ||
      !this.scene ||
      !this.camera ||
      !this.particles ||
      !this.positions ||
      !this.randomness ||
      !this.velX ||
      !this.velY ||
      !this.velZ ||
      !this.positionAttr ||
      !this.timer
    ) return;
  
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  
    this.timer.update();
    const dt = Math.min(this.timer.getDelta(), 0.033);
    const elapsed = this.timer.getElapsed();
  
    const uniforms = this.particles.material.uniforms;
    uniforms['uTime'].value = elapsed;
  
    const mouse = uniforms['uMouse'].value as THREE.Vector2;
  
    if (this.pointerInside && this.pendingPointer) {
      const { width, height } = this.getCanvasMetrics();
      mouse.x = (this.pendingPointer.x / width) * 2 - 1;
      mouse.y = -((this.pendingPointer.y / height) * 2 - 1);
    } else {
      mouse.set(999, 999);
    }
  
    const count = this.positions.length / 3;
  
    const b = this.bounds;
    const limit = b * 1.1;
    const zNear = -0.25;
    const zFar = -this.depth;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      const seed = this.randomness[i];

      let x = this.positions[i3];
      let y = this.positions[i3 + 1];
      let z = this.positions[i3 + 2];

      // Continuous forward motion (depth wrap is hidden by shader fading).
      z += this.velZ[i] * dt;

      // Curl-ish flow + gentle noise drift in XY.
      const n1 = Math.sin(elapsed * 0.8 + seed * 9.0 + x * 0.35 + y * 0.25);
      const n2 = Math.cos(elapsed * 0.7 + seed * 7.0 + y * 0.33 - x * 0.28);

      // Rotate around origin for a continuous swirling field.
      const rot = (0.28 + seed * 0.35) * dt;
      const cr = Math.cos(rot);
      const sr = Math.sin(rot);
      const rx = x * cr - y * sr;
      const ry = x * sr + y * cr;

      x = rx + (this.velX[i] + n1 * 0.35) * dt;
      y = ry + (this.velY[i] + n2 * 0.35) * dt;

      // Soft pull toward center keeps density stable (prevents edge build-up).
      x *= 1 - dt * 0.025;
      y *= 1 - dt * 0.025;

      this.positions[i3] = x;
      this.positions[i3 + 1] = y;
      this.positions[i3 + 2] = z;

      // Wrap depth (fade makes it look continuous).
      if (z > zNear) {
        this.positions[i3 + 2] = zFar - Math.random() * (this.depth * 0.12);
      }

      // Wrap X/Y to maintain continuous field.
      if (x > limit) this.positions[i3] = -limit;
      else if (x < -limit) this.positions[i3] = limit;
      if (y > limit) this.positions[i3 + 1] = -limit;
      else if (y < -limit) this.positions[i3 + 1] = limit;
    }
  
    this.positionAttr.needsUpdate = true;
  
    this.renderer.render(this.scene, this.camera);
  }

  private getCanvasMetrics(): { width: number; height: number; aspect: number } {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width || canvas.clientWidth || 1));
    const height = Math.max(1, Math.floor(rect.height || canvas.clientHeight || 1));
    return { width, height, aspect: width / height };
  }

  onResize(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.renderer || !this.camera || !this.scene) return;

    const { width, height, aspect } = this.getCanvasMetrics();
    const layoutChanged = this.updateLayoutForWidth(width);
    this.viewAspect = aspect;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    this.camera.position.z = 0;

    const desired = this.desiredCountForWidth(width);
    if (layoutChanged || desired !== this.count) this.createParticles(desired);

    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const material = this.particles?.material;
    if (material) {
      material.uniforms['uPixelRatio'].value = Math.min(window.devicePixelRatio, 2);
      material.uniforms['uBaseSize'].value = this.baseSizePx;
      material.uniforms['uHoverRadius'].value = this.hoverRadiusNdc;
      material.uniforms['uDepth'].value = this.depth;
    }
  }

  private cleanup(): void {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.removePointerListener?.();
    this.removePointerListener = undefined;

    this.timer?.dispose();
    this.timer = undefined;

    if (this.renderer) this.renderer.dispose();
    this.disposeParticles();
    this.scene?.clear();

    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this.pendingPointer = undefined;
    this.pointerInside = false;
  }

  ngOnDestroy(): void {}
}

