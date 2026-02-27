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

  private timer?: THREE.Timer;
  private animationFrameId?: number;
  private resizeObserver?: ResizeObserver;

  private pendingPointer?: { x: number; y: number };
  private pointerInside = false;
  private removePointerListener?: () => void;
  private mouseWorld = new THREE.Vector2(999999, 999999);

  private readonly svgUrl = '/assets/skill-icons/angular-original.svg';
  private sampledShape?: { points: Array<{ x: number; y: number }>; bounds: { minX: number; maxX: number; minY: number; maxY: number } };

  private particleCount = 0;
  private readonly mouseRadiusPx = 70;
  private readonly returnEase = 0.1;
  private readonly baseSizePx = 6.0;
  private readonly color = new THREE.Color(0xdd0031);

  constructor() {
    effect(() => {
      const isDark = this.themeService.darkMode();
      const material = this.particles?.material;
      if (!material) return;

      material.uniforms['uIsDark'].value = isDark ? 1.0 : 0.0;
      (material.uniforms['uColor'].value as THREE.Color).copy(this.color);
      material.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
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
    this.camera.position.z = 1;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.timer = new THREE.Timer();
    this.timer.connect(this.document);
  }

  private desiredCountForWidth(width: number): number {
    // CPU-updated particles: keep mobile-safe.
    if (width >= 1280) return 500;
    if (width >= 768) return 420;
    return 260;
  }

  private async initFromSvg(): Promise<void> {
    if (!this.scene) return;
    const { width } = this.getCanvasMetrics();
    const desiredCount = this.desiredCountForWidth(width);

    if (!this.sampledShape) {
      this.sampledShape = await this.sampleSvgFilledPoints(this.svgUrl, desiredCount);
    }

    this.createOrUpdateParticles(desiredCount);
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

  private createOrUpdateParticles(desiredCount: number): void {
    if (!this.scene || !this.camera || !this.renderer || !this.sampledShape) return;

    const count = Math.min(desiredCount, this.sampledShape.points.length);
    if (count <= 0) return;

    const { width, height } = this.getCanvasMetrics();
    const { minX, maxX, minY, maxY } = this.sampledShape.bounds;
    const shapeW = Math.max(1, maxX - minX);
    const shapeH = Math.max(1, maxY - minY);
    const scale = 0.82 * Math.min(width / shapeW, height / shapeH);
    const cx = minX + shapeW / 2;
    const cy = minY + shapeH / 2;

    const needRecreate = !this.particles || this.particleCount !== count;
    if (needRecreate) {
      this.disposeParticles();

      this.positions = new Float32Array(count * 3);
      this.basePositions = new Float32Array(count * 3);
      this.densities = new Float32Array(count);
      const randoms = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const p = this.sampledShape.points[i];

        const bx = (p.x - cx) * scale;
        const by = (cy - p.y) * scale;

        this.basePositions[i3] = bx;
        this.basePositions[i3 + 1] = by;
        this.basePositions[i3 + 2] = 0;

        // Start at the right edge of the camera frustum; particles ease left to their target.
        // Stagger vertical spread so it doesn't look like a flat horizontal sweep.
        this.positions[i3] = width / 2;
        this.positions[i3 + 1] = by + (Math.random() - 0.5) * height * 0.6;
        this.positions[i3 + 2] = 0;

        this.densities[i] = Math.random() * 30 + 1;
        randoms[i] = Math.random();
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
          uColor: { value: this.color.clone() },
          uIsDark: { value: isDark ? 1.0 : 0.0 },
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
          uBaseSize: { value: this.baseSizePx },
        },
        vertexShader: TEXT_SCRAPPER_VERTEX_SHADER,
        fragmentShader: TEXT_SCRAPPER_FRAGMENT_SHADER,
      });

      this.particles = new THREE.Points(geometry, material);
      this.particles.frustumCulled = false;
      this.scene.add(this.particles);
      this.particleCount = count;
      return;
    }

    // Update base positions for the new viewport, keeping current particle positions.
    if (!this.basePositions) return;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const p = this.sampledShape.points[i];
      this.basePositions[i3] = (p.x - cx) * scale;
      this.basePositions[i3 + 1] = (cy - p.y) * scale;
      this.basePositions[i3 + 2] = 0;
    }
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
    if (this.particles && this.positions && this.basePositions && this.densities && this.positionAttr) {
      const { width, height } = this.getCanvasMetrics();

      if (this.pointerInside && this.pendingPointer) {
        this.mouseWorld.x = this.pendingPointer.x - width / 2;
        this.mouseWorld.y = height / 2 - this.pendingPointer.y;
      } else {
        this.mouseWorld.set(999999, 999999);
      }

      const uniforms = this.particles.material.uniforms;
      uniforms['uTime'].value = elapsed;

      const count = this.particleCount;
      const mouseX = this.mouseWorld.x;
      const mouseY = this.mouseWorld.y;
      const radius = this.mouseRadiusPx;
      const ease = this.returnEase;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        const x = this.positions[i3];
        const y = this.positions[i3 + 1];

        const dx = mouseX - x;
        const dy = mouseY - y;
        const distSq = dx * dx + dy * dy;

        if (distSq < radius * radius) {
          const dist = Math.sqrt(distSq) + 0.00001;
          const force = (radius - dist) / radius;
          const density = this.densities[i];

          const dirX = (dx / dist) * force * density;
          const dirY = (dy / dist) * force * density;

          this.positions[i3] = x - dirX;
          this.positions[i3 + 1] = y - dirY;
        } else {
          const bx = this.basePositions[i3];
          const by = this.basePositions[i3 + 1];

          this.positions[i3] = x + (bx - x) * ease;
          this.positions[i3 + 1] = y + (by - y) * ease;
        }
      }

      this.positionAttr.needsUpdate = true;
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
      this.createOrUpdateParticles(desiredCount);
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
    if (!this.scene || !this.particles) return;
    this.scene.remove(this.particles);
    this.particles.geometry.dispose();
    (this.particles.material as THREE.Material).dispose();
    this.particles = undefined;
    this.positions = undefined;
    this.basePositions = undefined;
    this.densities = undefined;
    this.positionAttr = undefined;
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
  }
}
