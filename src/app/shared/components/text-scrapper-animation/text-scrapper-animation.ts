import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  ViewChild,
  afterNextRender,
  effect,
  inject,
} from '@angular/core';
import * as THREE from 'three';
import { ThemeService } from '../../../core/services/theme.service';

interface IconEntry {
  readonly url: string;
  readonly color: number;
}

type SampledShape = {
  points: Array<{ x: number; y: number }>;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
};

// Position used for "inactive" particles when current shape has fewer points than the pool.
const OFF_SCREEN = 1e5;

// One icon per slide color (hero→cyan, about→amber, projects→blue, experience→purple, contact→pink).
const ICON_ENTRIES: ReadonlyArray<IconEntry> = [
  { url: '/assets/skill-icons/tailwindcss-original.svg',     color: 0x4488ff },
  { url: '/assets/skill-icons/angular-original.svg', color: 0xf3a000 },
  { url: '/assets/skill-icons/ngrx-original.svg',          color: 0xff00ff },
  { url: '/assets/skill-icons/nodejs-original.svg',         color: 0x3c873a },
  { url: '/assets/skill-icons/git-original.svg',             color: 0xbc13fe },
];

const TEXT_SCRAPPER_VERTEX_SHADER = `
uniform float uTime;
uniform float uPixelRatio;
uniform float uBaseSize;

attribute float aRandom;

varying float vGlow;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float pulse = sin(uTime * 1.2 + aRandom * 6.2831) * 0.5 + 0.5;
  vGlow = 0.6 + pulse * 0.4;

  float size = uBaseSize * (1.0 + pulse * 0.45);
  gl_PointSize = min(size * uPixelRatio, 50.0);
}
`;

const TEXT_SCRAPPER_FRAGMENT_SHADER = `
uniform vec3 uColor;
uniform float uIsDark;

varying float vGlow;

void main() {
  float d = distance(gl_PointCoord, vec2(0.5));
  if (d > 0.5) discard;

  float core = smoothstep(0.18, 0.0, d);
  float halo = smoothstep(0.5, 0.14, d);

  vec3 highlight = mix(uColor, vec3(1.0), (uIsDark > 0.5) ? 0.62 : 0.28);
  vec3 color = mix(uColor, highlight, core);

  float alpha = (uIsDark > 0.5)
    ? (halo * 0.42 + core * 0.88)
    : (halo * 0.55 + core * 0.92);

  alpha *= vGlow;
  gl_FragColor = vec4(color, alpha);
}
`;

@Component({
  selector: 'app-text-scrapper-animation',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // Intended as a background overlay. Place inside a `relative` container.
    class: 'absolute inset-0 block overflow-hidden pointer-events-none',
    '(window:resize)': 'onResize()',
  },
  template: `<canvas #canvas class="absolute inset-0 h-full w-full"></canvas>`,
  styleUrl: './text-scrapper-animation.css',
})
export class TextScrapperAnimation {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private hostRef = inject(ElementRef<HTMLElement>);
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private themeService = inject(ThemeService);

  private scene?: THREE.Scene;
  private camera?: THREE.OrthographicCamera;
  private renderer?: THREE.WebGLRenderer;
  private particles?: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;

  private positions?: Float32Array;
  private basePositions?: Float32Array;
  private densities?: Float32Array;
  private positionAttr?: THREE.BufferAttribute;

  private orbitAngles?: Float32Array;
  private orbitRadii?: Float32Array;
  private orbitSpeeds?: Float32Array;

  private ambientParticles?: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private ambientPositions?: Float32Array;
  private ambientBases?: Float32Array;
  private ambientPhases?: Float32Array;
  private ambientAmps?: Float32Array;
  private ambientSpeeds?: Float32Array;
  private ambientPositionAttr?: THREE.BufferAttribute;
  private ambientCount = 0;
  private readonly AMBIENT_COUNT = 280;
  private readonly AMBIENT_DRIFT_AMP = 28;
  private readonly AMBIENT_SCRAMBLE_BOOST = 1.4;

  private timer?: THREE.Timer;
  private animationFrameId?: number;
  private resizeObserver?: ResizeObserver;

  private pendingPointer?: { x: number; y: number };
  private pointerInside = false;
  private removePointerListener?: () => void;
  private mouseWorld = new THREE.Vector2(999999, 999999);

  private readonly shapeCache = new Map<string, SampledShape>();
  private sampledShape?: SampledShape;
  private currentIconIndex = 0;
  private isSwitching = false;

  // State machine: 'settling' = converging to icon, 'scrambling' = scattering outward.
  private animPhase: 'settling' | 'scrambling' = 'settling';
  // 0 = no orbit (icon visible), 1 = full orbit (fully scattered).
  private orbitScale = 0;
  // Speed at which orbitScale grows or shrinks per frame (~1.5 s for 0↔1 at 60 fps).
  private readonly orbitScaleSpeed = 0.0011;

  // When icon is first detected as settled, we wait this long before starting scramble.
  private settledAt: number | null = null;
  private readonly settledPauseMs = 200;

  private readonly currentColor = new THREE.Color(ICON_ENTRIES[0].color);
  private readonly targetColor  = new THREE.Color(ICON_ENTRIES[0].color);
  private colorLerpT = 3.0;

  private particleCount = 0;
  private readonly mouseRadiusPx = 50;
  // Slower ease = slower generation (particles take longer to form the icon).
  private readonly returnEase = 0.055;
  private readonly baseSizePx = 6.0;

  constructor() {
    effect(() => {
      const isDark = this.themeService.darkMode();
      const material = this.particles?.material;
      if (material) {
        material.uniforms['uIsDark'].value = isDark ? 1.0 : 0.0;
        material.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
      }
      const ambientMat = this.ambientParticles?.material;
      if (ambientMat) {
        ambientMat.uniforms['uIsDark'].value = isDark ? 1.0 : 0.0;
        ambientMat.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
      }
    });

    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      if (!this.canvasRef?.nativeElement) return;

      this.initThree();
      this.attachResizeObserver();
      this.attachPointerTracking();
      void this.initFromSvg();
      this.animate();
    });

    this.destroyRef.onDestroy(() => this.cleanup());
  }

  private attachResizeObserver(): void {
    if (this.resizeObserver) return;
    // jsdom can lack ResizeObserver; browser runtime has it.
    if (typeof ResizeObserver === 'undefined') return;

    this.resizeObserver = new ResizeObserver(() => {
      // Keep size in sync with parent container.
      this.onResize();
    });

    this.resizeObserver.observe(this.hostRef.nativeElement);
  }

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    const { width, height } = this.getCanvasMetrics();

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -10, 10);

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.timer = new THREE.Timer();
    this.timer.connect(this.document);
  }

  private desiredCountForWidth(width: number): number {
    // CPU-updated particles: keep mobile-safe.
    if (width >= 1280) return 5000;
    if (width >= 768) return 3500;
    return 3500;
  }

  /** Max points across all cached shapes; used as the fixed particle pool size. */
  private getMaxPointCountFromCache(): number {
    if (this.shapeCache.size === 0) return 0;
    return Math.max(0, ...Array.from(this.shapeCache.values()).map((s) => s.points.length));
  }

  private async initFromSvg(): Promise<void> {
    if (!this.scene) return;
    const { width } = this.getCanvasMetrics();
    const desiredCount = this.desiredCountForWidth(width);

    // Preload all shapes first so we know the max point count and create one fixed pool.
    await this.preloadShapes(desiredCount);

    const maxPoints = this.getMaxPointCountFromCache();
    const poolSize = maxPoints > 0 ? Math.min(desiredCount, maxPoints) : desiredCount;

    const entry = ICON_ENTRIES[this.currentIconIndex];
    this.sampledShape = this.shapeCache.get(entry.url);
    if (!this.sampledShape) {
      this.sampledShape = await this.sampleSvgFilledPoints(entry.url, poolSize);
      this.shapeCache.set(entry.url, this.sampledShape);
    }

    this.currentColor.setHex(entry.color);
    this.targetColor.setHex(entry.color);
    this.colorLerpT = 1;

    this.createOrUpdateParticles(poolSize);
  }

  private async sampleSvgFilledPoints(
    url: string,
    maxPoints: number,
  ): Promise<{ points: Array<{ x: number; y: number }>; bounds: { minX: number; maxX: number; minY: number; maxY: number } }> {
    const res = await fetch(url);
    const svgText = await res.text();

    const parser = new DOMParser();
    const xml = parser.parseFromString(svgText, 'image/svg+xml');
    const paths = Array.from(xml.getElementsByTagName('path'))
      .map((p) => p.getAttribute('d'))
      .filter((d): d is string => !!d);

    const sampleW = 640;
    const sampleH = 260;
    const canvas = this.document.createElement('canvas');
    canvas.width = sampleW;
    canvas.height = sampleH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { points: [], bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 } };

    // Measure SVG path bounds in DOM space (browser-only).
    const measureSvg = this.document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    measureSvg.setAttribute('width', '0');
    measureSvg.setAttribute('height', '0');
    measureSvg.style.position = 'absolute';
    measureSvg.style.left = '-9999px';
    measureSvg.style.top = '-9999px';
    measureSvg.style.visibility = 'hidden';

    const pathEls: SVGPathElement[] = [];
    for (const d of paths) {
      const el = this.document.createElementNS('http://www.w3.org/2000/svg', 'path');
      el.setAttribute('d', d);
      measureSvg.appendChild(el);
      pathEls.push(el);
    }

    this.document.body.appendChild(measureSvg);
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const el of pathEls) {
      const bb = el.getBBox();
      minX = Math.min(minX, bb.x);
      minY = Math.min(minY, bb.y);
      maxX = Math.max(maxX, bb.x + bb.width);
      maxY = Math.max(maxY, bb.y + bb.height);
    }

    measureSvg.remove();

    if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
      return { points: [], bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 } };
    }

    const bbW = Math.max(1, maxX - minX);
    const bbH = Math.max(1, maxY - minY);
    const padding = 12;
    const scale = Math.min((sampleW - padding * 2) / bbW, (sampleH - padding * 2) / bbH);
    const offsetX = (sampleW - bbW * scale) / 2;
    const offsetY = (sampleH - bbH * scale) / 2;

    ctx.clearRect(0, 0, sampleW, sampleH);
    ctx.fillStyle = '#ffffff';

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    ctx.translate(-minX, -minY);

    for (const d of paths) {
      const path2d = new Path2D(d);
      ctx.fill(path2d);
    }
    ctx.restore();

    const img = ctx.getImageData(0, 0, sampleW, sampleH);
    const data = img.data;

    // Reservoir sampling over filled pixels to cap particle count without big arrays.
    const points: Array<{ x: number; y: number }> = [];
    let seen = 0;

    let pMinX = Number.POSITIVE_INFINITY;
    let pMinY = Number.POSITIVE_INFINITY;
    let pMaxX = Number.NEGATIVE_INFINITY;
    let pMaxY = Number.NEGATIVE_INFINITY;

    const stepPrimary = 2;
    const collect = (step: number): void => {
      points.length = 0;
      seen = 0;
      pMinX = Number.POSITIVE_INFINITY;
      pMinY = Number.POSITIVE_INFINITY;
      pMaxX = Number.NEGATIVE_INFINITY;
      pMaxY = Number.NEGATIVE_INFINITY;

      for (let y = 0; y < sampleH; y += step) {
        for (let x = 0; x < sampleW; x += step) {
          const a = data[(y * sampleW + x) * 4 + 3];
          if (a < 10) continue;

          seen++;
          if (points.length < maxPoints) {
            points.push({ x, y });
          } else {
            const j = Math.floor(Math.random() * seen);
            if (j < maxPoints) points[j] = { x, y };
          }

          pMinX = Math.min(pMinX, x);
          pMinY = Math.min(pMinY, y);
          pMaxX = Math.max(pMaxX, x);
          pMaxY = Math.max(pMaxY, y);
        }
      }
    };

    collect(stepPrimary);
    if (points.length < Math.min(80, maxPoints)) collect(1);

    if (!Number.isFinite(pMinX) || !Number.isFinite(pMinY) || !Number.isFinite(pMaxX) || !Number.isFinite(pMaxY)) {
      return { points: [], bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 } };
    }

    return { points, bounds: { minX: pMinX, maxX: pMaxX, minY: pMinY, maxY: pMaxY } };
  }

  private async preloadShapes(desiredCount: number): Promise<void> {
    for (const entry of ICON_ENTRIES) {
      if (!this.shapeCache.has(entry.url)) {
        try {
          this.shapeCache.set(entry.url, await this.sampleSvgFilledPoints(entry.url, desiredCount));
        } catch {
          // Skip icons that fail to load (missing asset, network error).
        }
      }
    }
  }

  private async switchToNextIcon(): Promise<void> {
    if (this.isSwitching) return;
    this.isSwitching = true;

    const { width } = this.getCanvasMetrics();
    const desiredCount = this.desiredCountForWidth(width);

    // Advance to the next index, skipping any that failed to cache.
    let attempts = 0;
    do {
      this.currentIconIndex = (this.currentIconIndex + 1) % ICON_ENTRIES.length;
      attempts++;
    } while (!this.shapeCache.has(ICON_ENTRIES[this.currentIconIndex].url) && attempts < ICON_ENTRIES.length);

    const entry = ICON_ENTRIES[this.currentIconIndex];

    if (!this.shapeCache.has(entry.url)) {
      try {
        this.shapeCache.set(entry.url, await this.sampleSvgFilledPoints(entry.url, desiredCount));
      } catch {
        this.isSwitching = false;
        return;
      }
    }

    this.sampledShape = this.shapeCache.get(entry.url)!;
    this.targetColor.setHex(entry.color);
    this.colorLerpT = 0;

    this.updateBasePositionsOnly();
    this.snapPositionsToBase();
    this.isSwitching = false;
  }

  private snapPositionsToBase(): void {
    if (!this.positions || !this.basePositions || !this.positionAttr) return;
    const activeCount = this.sampledShape ? this.sampledShape.points.length : 0;
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      this.positions[i3] = this.basePositions[i3];
      this.positions[i3 + 1] = this.basePositions[i3 + 1];
      this.positions[i3 + 2] = 0;
    }
    this.positionAttr.needsUpdate = true;
  }

  private updateBasePositionsOnly(): void {
    if (!this.sampledShape || !this.basePositions || !this.particles) return;

    const { width, height } = this.getCanvasMetrics();
    const { minX, maxX, minY, maxY } = this.sampledShape.bounds;
    const shapeW = Math.max(1, maxX - minX);
    const shapeH = Math.max(1, maxY - minY);
    const scale = 0.52 * Math.min(width / shapeW, height / shapeH);
    const cx = minX + shapeW / 2;
    const cy = minY + shapeH / 2;
    const activeCount = this.sampledShape.points.length;

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      if (i < activeCount) {
        const p = this.sampledShape.points[i];
        this.basePositions[i3]     = (p.x - cx) * scale;
        this.basePositions[i3 + 1] = (cy - p.y) * scale;
      } else {
        this.basePositions[i3]     = OFF_SCREEN;
        this.basePositions[i3 + 1] = OFF_SCREEN;
      }
      this.basePositions[i3 + 2] = 0;
    }
  }

  private createOrUpdateParticles(poolSize: number): void {
    if (!this.scene || !this.camera || !this.renderer || !this.sampledShape) return;
    if (poolSize <= 0) return;

    const { width, height } = this.getCanvasMetrics();
    const { minX, maxX, minY, maxY } = this.sampledShape.bounds;
    const shapeW = Math.max(1, maxX - minX);
    const shapeH = Math.max(1, maxY - minY);
    const scale = 0.52 * Math.min(width / shapeW, height / shapeH);
    const cx = minX + shapeW / 2;
    const cy = minY + shapeH / 2;
    const activeCount = Math.min(poolSize, this.sampledShape.points.length);

    const needRecreate = !this.particles || this.particleCount !== poolSize;
    if (needRecreate) {
      this.disposeParticles();

      this.positions = new Float32Array(poolSize * 3);
      this.basePositions = new Float32Array(poolSize * 3);
      this.densities = new Float32Array(poolSize);
      this.orbitAngles = new Float32Array(poolSize);
      this.orbitRadii = new Float32Array(poolSize);
      this.orbitSpeeds = new Float32Array(poolSize);
      const randoms = new Float32Array(poolSize);

      const maxOrbitR = Math.min(width, height) * 0.08;

      for (let i = 0; i < poolSize; i++) {
        const i3 = i * 3;
        const isActive = i < activeCount;
        let bx: number;
        let by: number;
        let startX: number;
        let startY: number;

        if (isActive) {
          const p = this.sampledShape.points[i];
          bx = (p.x - cx) * scale;
          by = (cy - p.y) * scale;
          startX = bx;
          startY = by;
        } else {
          bx = OFF_SCREEN;
          by = OFF_SCREEN;
          startX = OFF_SCREEN;
          startY = OFF_SCREEN;
        }

        this.basePositions[i3] = bx;
        this.basePositions[i3 + 1] = by;
        this.basePositions[i3 + 2] = 0;

        this.positions[i3] = startX;
        this.positions[i3 + 1] = startY;
        this.positions[i3 + 2] = 0;

        this.densities[i] = Math.random() * 30 + 1;
        randoms[i] = Math.random();

        this.orbitAngles[i] = Math.random() * Math.PI * 2.6;
        this.orbitRadii[i] = (0.7 + Math.random() * 0.7) * maxOrbitR;
        this.orbitSpeeds[i] = (0.5 + Math.random()) * (Math.random() < 0.5 ? 0.5 : -0.5);
      }

      const geometry = new THREE.BufferGeometry();
      this.positionAttr = new THREE.BufferAttribute(this.positions, 3);
      geometry.setAttribute('position', this.positionAttr);
      geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

      const isDark = this.themeService.darkMode();
      const material = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: this.currentColor.clone() },
          uIsDark: { value: isDark ? 1.0 : 0.0 },
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
          uBaseSize: { value: this.baseSizePx },
        },
        vertexShader: TEXT_SCRAPPER_VERTEX_SHADER,
        fragmentShader: TEXT_SCRAPPER_FRAGMENT_SHADER,
      });

      this.createAmbientParticles();
      this.particles = new THREE.Points(geometry, material);
      this.particles.frustumCulled = false;
      this.scene.add(this.particles);
      this.particleCount = poolSize;
      return;
    }

    // Same pool size: only update base positions (e.g. viewport or shape change).
    this.updateBasePositionsOnly();
  }

  private createAmbientParticles(): void {
    if (!this.scene || !this.camera || !this.renderer) return;

    this.disposeAmbientParticles();

    const { width, height } = this.getCanvasMetrics();
    const halfW = width / 2;
    const halfH = height / 2;
    const n = this.AMBIENT_COUNT;

    this.ambientPositions = new Float32Array(n * 3);
    this.ambientBases = new Float32Array(n * 2);
    this.ambientPhases = new Float32Array(n * 2);
    this.ambientAmps = new Float32Array(n * 2);
    this.ambientSpeeds = new Float32Array(n * 2);
    const randoms = new Float32Array(n);

    for (let i = 0; i < n; i++) {
      const t = i / n;
      const r = Math.sqrt(Math.random()) * Math.min(halfW, halfH) * 0.92;
      const theta = Math.random() * Math.PI * 2;
      const bx = Math.cos(theta) * r + (Math.random() - 0.5) * width * 0.15;
      const by = Math.sin(theta) * r + (Math.random() - 0.5) * height * 0.15;
      this.ambientBases[i * 2] = bx;
      this.ambientBases[i * 2 + 1] = by;
      this.ambientPhases[i * 2] = Math.random() * Math.PI * 2;
      this.ambientPhases[i * 2 + 1] = Math.random() * Math.PI * 2;
      this.ambientAmps[i * 2] = this.AMBIENT_DRIFT_AMP * (0.4 + Math.random() * 0.6);
      this.ambientAmps[i * 2 + 1] = this.AMBIENT_DRIFT_AMP * (0.4 + Math.random() * 0.6);
      this.ambientSpeeds[i * 2] = 0.4 + Math.random() * 0.5;
      this.ambientSpeeds[i * 2 + 1] = 0.35 + Math.random() * 0.55;
      this.ambientPositions[i * 3] = bx;
      this.ambientPositions[i * 3 + 1] = by;
      this.ambientPositions[i * 3 + 2] = 0;
      randoms[i] = Math.random();
    }

    this.ambientPositionAttr = new THREE.BufferAttribute(this.ambientPositions, 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', this.ambientPositionAttr);
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

    const isDark = this.themeService.darkMode();
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: this.currentColor.clone() },
        uIsDark: { value: isDark ? 1.0 : 0.0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uBaseSize: { value: this.baseSizePx * 0.65 },
      },
      vertexShader: TEXT_SCRAPPER_VERTEX_SHADER,
      fragmentShader: TEXT_SCRAPPER_FRAGMENT_SHADER,
    });

    this.ambientParticles = new THREE.Points(geometry, material);
    this.ambientParticles.frustumCulled = false;
    this.scene.add(this.ambientParticles);
    if (this.particles) {
      this.scene.remove(this.particles);
      this.scene.add(this.particles);
    }
    this.ambientCount = n;
  }

  private disposeAmbientParticles(): void {
    if (!this.scene || !this.ambientParticles) return;
    this.scene.remove(this.ambientParticles);
    this.ambientParticles.geometry.dispose();
    (this.ambientParticles.material as THREE.Material).dispose();
    this.ambientParticles = undefined;
    this.ambientPositions = undefined;
    this.ambientBases = undefined;
    this.ambientPhases = undefined;
    this.ambientAmps = undefined;
    this.ambientSpeeds = undefined;
    this.ambientPositionAttr = undefined;
    this.ambientCount = 0;
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

    this.document.addEventListener('pointermove', onPointerMove, { passive: true });
    this.removePointerListener = () => this.document.removeEventListener('pointermove', onPointerMove);
  }

  private animate(): void {
    if (!this.renderer || !this.scene || !this.camera || !this.timer) return;

    this.animationFrameId = requestAnimationFrame(() => this.animate());

    this.timer.update();
    const elapsed = this.timer.getElapsed();

    // Keep rendering even before particles exist (async SVG load).
    if (
      this.particles &&
      this.positions &&
      this.basePositions &&
      this.densities &&
      this.positionAttr &&
      this.orbitAngles &&
      this.orbitRadii &&
      this.orbitSpeeds
    ) {
      const { width, height } = this.getCanvasMetrics();

      if (this.pointerInside && this.pendingPointer) {
        this.mouseWorld.x = this.pendingPointer.x - width / 2;
        this.mouseWorld.y = height / 2 - this.pendingPointer.y;
      } else {
        this.mouseWorld.set(999999, 999999);
      }

      const uniforms = this.particles.material.uniforms;
      uniforms['uTime'].value = elapsed;

      // ── State machine: advance orbitScale ─────────────────────────
      // 'scrambling' → orbitScale grows toward 1 (particles scatter).
      // 'settling'   → orbitScale shrinks toward 0 (particles reform).
      if (this.animPhase === 'scrambling') {
        this.orbitScale = Math.min(1, this.orbitScale + this.orbitScaleSpeed);

        // At scatter peak: swap to the next icon and start settling.
        if (this.orbitScale >= 0.98 && !this.isSwitching) {
          void this.switchToNextIcon();   // updates basePositions + targetColor
          this.animPhase = 'settling';
        }
      } else {
        this.orbitScale = Math.max(0, this.orbitScale - this.orbitScaleSpeed);
      }

      // Cubic smoothstep on orbitScale for smooth ease-in / ease-out.
      const sm = this.orbitScale * this.orbitScale * (3 - 2 * this.orbitScale);

      // ── Smooth color lerp (driven by same speed as orbitScale) ────
      if (this.colorLerpT < 1) {
        this.colorLerpT = Math.min(1, this.colorLerpT + this.orbitScaleSpeed);
        this.currentColor.lerp(this.targetColor, this.orbitScaleSpeed);
        (uniforms['uColor'].value as THREE.Color).copy(this.currentColor);
      }

      const count  = this.particleCount;
      const mouseX = this.mouseWorld.x;
      const mouseY = this.mouseWorld.y;
      const radius = this.mouseRadiusPx;
      const ease   = this.returnEase;

      const orbitAngles = this.orbitAngles;
      const orbitRadii  = this.orbitRadii;
      const orbitSpeeds = this.orbitSpeeds;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const x  = this.positions[i3];
        const y  = this.positions[i3 + 1];
        const bx = this.basePositions[i3];
        const by = this.basePositions[i3 + 1];

        // Circular orbit target; radius is zero when fully settled.
        const angle = orbitAngles[i] + elapsed * orbitSpeeds[i];
        const orbR  = orbitRadii[i] * sm;
        const tx    = bx + Math.cos(angle) * orbR;
        const ty    = by + Math.sin(angle) * orbR;

        const dx     = mouseX - x;
        const dy     = mouseY - y;
        const distSq = dx * dx + dy * dy;

        if (distSq < radius * radius) {
          const dist    = Math.sqrt(distSq) + 0.001;
          const force   = (radius - dist) / radius;
          const density = this.densities[i];

          this.positions[i3]     = x - (dx / dist) * force * density;
          this.positions[i3 + 1] = y - (dy / dist) * force * density;
        } else {
          this.positions[i3]     = x + (tx - x) * ease;
          this.positions[i3 + 1] = y + (ty - y) * ease;
        }
      }

      this.positionAttr.needsUpdate = true;

      // ── Ambient motes: gentle drift, react to icon scramble/settle ─
      if (
        this.ambientParticles &&
        this.ambientPositions &&
        this.ambientBases &&
        this.ambientPhases &&
        this.ambientAmps &&
        this.ambientSpeeds &&
        this.ambientPositionAttr
      ) {
        const ambientUniforms = this.ambientParticles.material.uniforms;
        (ambientUniforms['uColor'].value as THREE.Color).copy(this.currentColor);
        ambientUniforms['uTime'].value = elapsed;
        const boost = 1 + sm * (this.AMBIENT_SCRAMBLE_BOOST - 1);
        for (let i = 0; i < this.ambientCount; i++) {
          const i2 = i * 2;
          const i3 = i * 3;
          const bx = this.ambientBases[i2];
          const by = this.ambientBases[i2 + 1];
          const driftX = Math.sin(elapsed * this.ambientSpeeds[i2] + this.ambientPhases[i2]) * this.ambientAmps[i2] * boost;
          const driftY = Math.cos(elapsed * this.ambientSpeeds[i2 + 1] + this.ambientPhases[i2 + 1]) * this.ambientAmps[i2 + 1] * boost;
          this.ambientPositions[i3] = bx + driftX;
          this.ambientPositions[i3 + 1] = by + driftY;
          this.ambientPositions[i3 + 2] = 0;
        }
        this.ambientPositionAttr.needsUpdate = true;
      }

      // ── Convergence check (settling phase, orbit fully retracted) ─
      // Sample only active particles (those forming the current icon).
      const activeCount = this.sampledShape
        ? Math.min(count, this.sampledShape.points.length)
        : 0;
      if (this.animPhase === 'settling' && this.orbitScale === 0 && activeCount > 0) {
        let distSqSum = 0;
        const step = Math.max(1, Math.floor(activeCount / 150));
        let samples = 0;

        for (let i = 0; i < activeCount; i += step) {
          const i3 = i * 3;
          const dx = this.positions[i3]     - this.basePositions[i3];
          const dy = this.positions[i3 + 1] - this.basePositions[i3 + 1];
          distSqSum += dx * dx + dy * dy;
          samples++;
        }

        const avgDist = samples > 0 ? Math.sqrt(distSqSum / samples) : 999;
        if (avgDist < 1.5) {
          if (this.settledAt === null) this.settledAt = elapsed;
          const pauseSec = this.settledPauseMs / 1000;
          if (elapsed - this.settledAt >= pauseSec) {
            this.animPhase = 'scrambling';
            this.settledAt = null;
          }
        } else {
          this.settledAt = null;
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  onResize(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.renderer || !this.camera) return;

    const { width, height } = this.getCanvasMetrics();

    this.camera.left = -width / 2;
    this.camera.right = width / 2;
    this.camera.top = height / 2;
    this.camera.bottom = -height / 2;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const material = this.particles?.material;
    if (material) {
      material.uniforms['uPixelRatio'].value = Math.min(window.devicePixelRatio, 2);
      material.uniforms['uBaseSize'].value = this.baseSizePx;
    }

    if (this.sampledShape) {
      const desiredCount = this.desiredCountForWidth(width);
      const maxPoints = this.getMaxPointCountFromCache();
      const poolSize = maxPoints > 0 ? Math.min(desiredCount, maxPoints) : desiredCount;
      this.createOrUpdateParticles(poolSize);
      if (this.particles) this.createAmbientParticles();
    }
  }

  private getCanvasMetrics(): { width: number; height: number } {
    const host = this.hostRef.nativeElement;
    const rect = host.getBoundingClientRect();
    const measuredWidth = Math.floor(rect.width || 0);
    const measuredHeight = Math.floor(rect.height || 0);

    // If this component is mounted inside a layout that hasn't resolved yet,
    // initial measurements can be ~0. Use viewport as a practical fallback.
    const width = measuredWidth >= 50 ? measuredWidth : window.innerWidth;
    const height = measuredHeight >= 50 ? measuredHeight : window.innerHeight;
    return { width, height };
  }

  private disposeParticles(): void {
    this.disposeAmbientParticles();
    if (!this.scene || !this.particles) return;
    this.scene.remove(this.particles);
    this.particles.geometry.dispose();
    (this.particles.material as THREE.Material).dispose();
    this.particles = undefined;
    this.positions = undefined;
    this.basePositions = undefined;
    this.densities = undefined;
    this.positionAttr = undefined;
    this.orbitAngles = undefined;
    this.orbitRadii = undefined;
    this.orbitSpeeds = undefined;
    this.particleCount = 0;
  }

  private cleanup(): void {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
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
    this.shapeCache.clear();
    this.isSwitching = false;
    this.animPhase = 'settling';
    this.orbitScale = 0;
    this.settledAt = null;
  }
}
