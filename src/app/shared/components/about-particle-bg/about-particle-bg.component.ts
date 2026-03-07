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
uniform float uFov;
uniform float uPScale;

attribute float aRandom;
attribute float aSize;

varying float vHover;
varying float vAlpha;
varying float vGlow;

float hash(float n) { return fract(sin(n) * 43758.5453123); }

void main() {
  vec3 p = position;
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  vec2 ndc = gl_Position.xy / gl_Position.w;
  float dist = distance(ndc, uMouse);
  float hover = smoothstep(uHoverRadius, 0.0, dist);

  float depth = -mvPosition.z;
  float s = uFov / (depth + uFov);
  float size = uBaseSize * s * s * (1.0 + aSize) * uPScale * uPixelRatio;
  size *= 2.2 + hover * 0.8;
  gl_PointSize = min(size, 80.0);

  float alpha = clamp(s * 1.4 - 0.5, 0.0, 1.0);
  float seed = aRandom;
  float pulse = sin(uTime * 1.1 + seed * 6.2831) * 0.5 + 0.5;

  vHover = hover;
  vAlpha = alpha;
  vGlow = 0.75 + pulse * 0.25 + hover * 0.4 + hash(seed * 2.3) * 0.15;
}
`;

const ABOUT_FRAGMENT_SHADER = `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uIsDark;
uniform float uLayerAlpha;

varying float vHover;
varying float vAlpha;
varying float vGlow;

void main() {
  float d = distance(gl_PointCoord, vec2(0.5));
  if (d > 0.5) discard;

  float core = smoothstep(0.18, 0.0, d);
  float halo = smoothstep(0.5, 0.14, d);

  vec3 base = mix(uColorA, uColorB, core);
  vec3 highlight = mix(base, vec3(1.0), (uIsDark > 0.5) ? 0.25 : 0.32);
  vec3 color = mix(base, highlight, core);

  float alphaBase = (uIsDark > 0.5)
    ? (halo * 0.30 + core * 0.70)
    : (halo * 0.45 + core * 0.80);

  float alpha = alphaBase * vGlow * (2.0 + vHover * 0.7) * vAlpha * uLayerAlpha;
  alpha *= (uIsDark > 0.5) ? 2.35 : 2.15;
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
  private layers: HelixLayerState[] = [];

  private timer?: THREE.Timer;
  private mouse = new THREE.Vector2(999, 999);
  private animationFrameId?: number;
  private removePointerListener?: () => void;
  private resizeObserver?: ResizeObserver;
  private pointerInside = false;
  private pendingPointer?: { x: number; y: number };

  private bounds = 10.0;
  private baseSizePx = 4.6;
  private hoverRadiusNdc = 1.22;
  private layoutBucket: 0 | 1 | 2 = 0;
  private viewAspect = 1.5;
  private w = 1;
  private h = 1;
  private min = 1;
  private adjW = 1;
  private readonly globalSpeed = 1;
  private globalParticleScale = 0.66;
  private readonly ABOUT_COLOR = new THREE.Color(0xf3a000);
  private readonly ABOUT_COLOR_ACCENT = new THREE.Color(0xf3a000).offsetHSL(0.02, 0.08, 0.12);

  private readonly overscan = 0.6;

  private static readonly LAYER_CONFIGS: HelixLayerConfig[] = [
    { count: 100, speed: 0.1, alpha: 0.1, particleScale: 5, amplitude: 0.6, altAmplitude: 1.6, rotations: 3, startRotation: 0, rotationDeg: 0 },
    { count: 150, speed: -0.5, alpha: 0.3, particleScale: 3, amplitude: 0.1, altAmplitude: 2, rotations: 3, startRotation: 0, rotationDeg: -20 },
    { count: 2000, speed: 2, alpha: 1, particleScale: 0.4, amplitude: 0.4, altAmplitude: 0.5, rotations: 2.5, startRotation: 0.33, rotationDeg: -40 },
    { count: 2000, speed: 2, alpha: 1, particleScale: 0.4, amplitude: 0.4, altAmplitude: 0.5, rotations: 2.5, startRotation: 0.83, rotationDeg: -40 },
    { count: 100, speed: -3, alpha: 1, particleScale: 0.5, amplitude: 0.4, altAmplitude: 0.5, rotations: 2.5, startRotation: 0.83, rotationDeg: -40 },
    { count: 100, speed: -3, alpha: 1, particleScale: 0.5, amplitude: 0.4, altAmplitude: 0.5, rotations: 2.5, startRotation: 0.33, rotationDeg: -40 },
  ];

  constructor() {
    effect(() => {
      const isDark = this.themeService.darkMode();
      for (const layer of this.layers) {
        const material = layer.points.material;
        material.uniforms['uIsDark'].value = isDark ? 1.0 : 0.0;
        (material.uniforms['uColorA'].value as THREE.Color).copy(this.ABOUT_COLOR);
        (material.uniforms['uColorB'].value as THREE.Color).copy(this.ABOUT_COLOR_ACCENT);
        material.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
      }
    });

    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      if (!this.canvasRef?.nativeElement) return;

      this.initThree();
      this.attachResizeObserver();
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
    this.w = width;
    this.h = height;
    this.min = Math.min(width, height);
    this.adjW = width * (1 + this.overscan * 2);
    this.globalParticleScale = (this.min / 1000) * 0.3;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(78, aspect, 0.1, 10000);
    this.camera.position.set(0, 0, this.min * 4);

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.timer = new THREE.Timer();
    this.timer.connect(this.document);

    this.createLayers();

    requestAnimationFrame(() => this.onResize());
  }

  private layerCountScale(width: number): number {
    if (width >= 1280) return 1.5;
    if (width >= 768) return 1.3;
    return 1.3;
  }

  private applyLayoutForWidth(width: number): void {
    if (width >= 1280) {
      this.bounds = 10.5;
      this.baseSizePx = 14;
      this.hoverRadiusNdc = 0.2;
      this.layoutBucket = 2;
      return;
    }

    if (width >= 768) {
      this.bounds = 8.8;
      this.baseSizePx = 14;
      this.hoverRadiusNdc = 0.21;
      this.layoutBucket = 1;
      return;
    }

    this.bounds = 8.8;
    this.baseSizePx = 14;
    this.hoverRadiusNdc = 0.22;
    this.layoutBucket = 1;
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

  private disposeLayers(): void {
    if (!this.scene) return;
    for (const layer of this.layers) {
      this.scene.remove(layer.points);
      layer.points.geometry.dispose();
      (layer.points.material as THREE.Material).dispose();
    }
    this.layers = [];
  }

  private static rnd(min: number, max?: number): number {
    if (max === undefined) {
      max = min;
      min = 0;
    }
    return Math.random() * (max - min) + min;
  }

  private initHelixParticle(
    layer: HelixLayerState,
    i: number
  ): void {
    const seed = Math.random();
    layer.randomness[i] = seed;
    layer.particleT[i] = Math.random();
    const spd = Math.pow(seed * 0.5 + 0.5, 3);
    layer.particleSpeed[i] = spd;
    layer.sizeAttr[i] = 1 - spd;
    layer.altAmp[i] = AboutParticleBgComponent.rnd(0.1, 0.6) * AboutParticleBgComponent.rnd(0, spd) * (Math.random() < 0.5 ? -1 : 1);
    layer.altPer[i] = AboutParticleBgComponent.rnd(0.3, 2);
    layer.altStart[i] = AboutParticleBgComponent.rnd(Math.PI * 2);
  }

  private createLayers(): void {
    if (!this.scene) return;
    this.disposeLayers();

    const isDark = this.themeService.darkMode();
    const countScale = this.layerCountScale(this.w);
    const fov = this.min;
    const scaleX = fov / (this.adjW / 2);
    const scaleYZ = 1.2;

    for (const config of AboutParticleBgComponent.LAYER_CONFIGS) {
      const count = Math.max(20, Math.floor(config.count * countScale));
      const positions = new Float32Array(count * 3);
      const randomness = new Float32Array(count);
      const sizeAttr = new Float32Array(count);
      const particleT = new Float32Array(count);
      const particleSpeed = new Float32Array(count);
      const altAmp = new Float32Array(count);
      const altPer = new Float32Array(count);
      const altStart = new Float32Array(count);

      const layerState: HelixLayerState = {
        config: { ...config, count },
        points: null!,
        positions,
        positionAttr: new THREE.BufferAttribute(positions, 3),
        randomness,
        sizeAttr,
        particleT,
        particleSpeed,
        altAmp,
        altPer,
        altStart,
      };

      for (let i = 0; i < count; i++) {
        this.initHelixParticle(layerState, i);
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', layerState.positionAttr);
      geometry.setAttribute('aRandom', new THREE.BufferAttribute(randomness, 1));
      geometry.setAttribute('aSize', new THREE.BufferAttribute(sizeAttr, 1));

      const pScale = config.particleScale * this.globalParticleScale;
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
          uFov: { value: fov * 4 },
          uPScale: { value: pScale },
          uLayerAlpha: { value: config.alpha },
          uIsDark: { value: isDark ? 1.0 : 0.0 },
          uColorA: { value: this.ABOUT_COLOR.clone() },
          uColorB: { value: this.ABOUT_COLOR_ACCENT.clone() },
        },
        vertexShader: ABOUT_VERTEX_SHADER,
        fragmentShader: ABOUT_FRAGMENT_SHADER,
      });

      layerState.points = new THREE.Points(geometry, material);
      this.scene.add(layerState.points);
      this.layers.push(layerState);
    }
  }

  private attachResizeObserver(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || this.resizeObserver) return;

    this.resizeObserver = new ResizeObserver(() => {
      this.onResize();
    });
    this.resizeObserver.observe(canvas);
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
    if (!this.renderer || !this.scene || !this.camera || !this.timer || this.layers.length === 0) return;

    this.animationFrameId = requestAnimationFrame(() => this.animate());

    this.timer.update();
    const dt = Math.min(this.timer.getDelta(), 0.033) * 1000;
    const elapsed = this.timer.getElapsed();
    const fov = this.min;
    const cameraZ = this.min * 4;
    const scaleX = fov / (this.adjW / 1.4);
    const scaleYZ = 0.6;

    for (const layer of this.layers) {
      const mat = layer.points.material;
      mat.uniforms['uTime'].value = elapsed;

      const cfg = layer.config;
      const a0 = cfg.amplitude * 0.5;
      const a1 = cfg.altAmplitude * 0.5;
      const rotations = cfg.rotations * Math.PI * 2;
      const startRotation = cfg.startRotation * Math.PI * 2;
      const speed = cfg.speed * this.globalSpeed;
      const rotRad = (cfg.rotationDeg * Math.PI) / 180;
      const cr = Math.cos(rotRad);
      const sr = Math.sin(rotRad);
      const count = cfg.count;

      for (let i = 0; i < count; i++) {
        let t = (layer.particleT[i] + dt * 0.0001 * speed * layer.particleSpeed[i]) % 1;
        if (t < 0) t += 1;
        layer.particleT[i] = t;

        const xHelix = t * this.adjW - this.adjW / 2;
        const tNorm = xHelix / this.adjW;
        const altPer = layer.altPer[i] * Math.PI * 2;

        let y = Math.sin(tNorm * rotations + startRotation) * this.min * a0;
        let z = Math.cos(tNorm * rotations + startRotation) * this.min * a0;
        y += Math.sin(tNorm * altPer + layer.altStart[i]) * this.min * layer.altAmp[i] * a1;
        z += Math.cos(tNorm * altPer + layer.altStart[i]) * this.min * layer.altAmp[i] * a1;

        let xw = xHelix * scaleX;
        let yw = y * scaleYZ;
        const zw = cameraZ - (z + this.min) * scaleYZ;

        const xr = xw * cr - yw * sr;
        const yr = xw * sr + yw * cr;

        layer.positions[i * 3] = xr;
        layer.positions[i * 3 + 1] = yr;
        layer.positions[i * 3 + 2] = zw;
      }

      layer.positionAttr.needsUpdate = true;
    }

    if (this.pointerInside && this.pendingPointer) {
      const { width, height } = this.getCanvasMetrics();
      this.mouse.x = (this.pendingPointer.x / width) * 2 - 1;
      this.mouse.y = -((this.pendingPointer.y / height) * 2 - 1);
    } else {
      this.mouse.set(999, 999);
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

  onResize(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.renderer || !this.camera || !this.scene) return;

    const { width, height, aspect } = this.getCanvasMetrics();
    const hadTinySize = this.min <= 2;
    const layoutChanged = this.updateLayoutForWidth(width);
    this.viewAspect = aspect;
    this.w = width;
    this.h = height;
    this.min = Math.min(width, height);
    this.adjW = width * (2 + this.overscan * 2);
    this.globalParticleScale = (this.min / 1000) * 0.3;

    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    this.camera.position.set(0, 0, this.min * 4);

    if (layoutChanged || hadTinySize) this.createLayers();

    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const pr = Math.min(window.devicePixelRatio, 2);
    for (const layer of this.layers) {
      const material = layer.points.material;
      if (material instanceof THREE.ShaderMaterial) {
        material.uniforms['uPixelRatio'].value = pr;
        material.uniforms['uBaseSize'].value = this.baseSizePx;
        material.uniforms['uHoverRadius'].value = this.hoverRadiusNdc;
        material.uniforms['uFov'].value = this.min * 4;
        material.uniforms['uPScale'].value = layer.config.particleScale * this.globalParticleScale;
      }
    }
  }

  private cleanup(): void {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.removePointerListener?.();
    this.removePointerListener = undefined;
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;

    this.timer?.dispose();
    this.timer = undefined;

    if (this.renderer) this.renderer.dispose();
    this.disposeLayers();
    this.scene?.clear();

    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this.pendingPointer = undefined;
    this.pointerInside = false;
  }

  ngOnDestroy(): void {}
}

interface HelixLayerConfig {
  count: number;
  speed: number;
  alpha: number;
  particleScale: number;
  amplitude: number;
  altAmplitude: number;
  rotations: number;
  startRotation: number;
  rotationDeg: number;
}

interface HelixLayerState {
  config: HelixLayerConfig;
  points: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  positions: Float32Array;
  positionAttr: THREE.BufferAttribute;
  randomness: Float32Array;
  sizeAttr: Float32Array;
  particleT: Float32Array;
  particleSpeed: Float32Array;
  altAmp: Float32Array;
  altPer: Float32Array;
  altStart: Float32Array;
}

