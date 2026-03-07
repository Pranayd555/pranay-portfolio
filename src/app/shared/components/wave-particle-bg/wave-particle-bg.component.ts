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
  selector: 'app-wave-particle-bg',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block absolute inset-0 pointer-events-none',
    '(window:resize)': 'onResize()',
  },
  template: `<canvas #canvas class="absolute inset-0 h-full w-full"></canvas>`,
})
export class WaveParticleBgComponent implements OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private themeService = inject(ThemeService);

  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private renderer?: THREE.WebGLRenderer;
  private particles?: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;

  private animationFrameId?: number;
  private timer?: THREE.Timer;

  private removePointerListener?: () => void;
  private pendingPointer?: { x: number; y: number };
  private pointerInside = false;

  private readonly GRID_X = 300;
  private readonly GRID_Y = 300;
  private readonly BASE_SIZE_PX = 2;
  private readonly HOVER_RADIUS_NDC = 0.22;

  constructor() {
    effect(() => {
      const material = this.particles?.material;
      if (!material) return;

      const isDark = this.themeService.darkMode();
      material.uniforms['uIsDark'].value = isDark ? 1.0 : 0.0;
      material.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;

      const colorA = isDark ? new THREE.Color(0x00f3ff) : new THREE.Color(0x135bec);
      const colorB = isDark ? new THREE.Color(0x6d2cff) : new THREE.Color(0x00a8ff);
      (material.uniforms['uColorA'].value as THREE.Color).copy(colorA);
      (material.uniforms['uColorB'].value as THREE.Color).copy(colorB);
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

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1);
    this.camera.position.set(1.5, -0.3, 0.4);

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.timer = new THREE.Timer();
    this.timer.connect(this.document);

    const geometry = new THREE.BufferGeometry();

    const count = Math.min(10000, this.GRID_X * this.GRID_Y);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);

    // Compute the visible frustum at z=0 (the particle base plane) so the
    // grid always fills the screen on any aspect ratio (portrait mobile included).
    const camZ = 0.7;   // camera.position.z
    const camX = 1;   // camera.position.x
    const camY = -0.3;  // camera.position.y
    const fovHalfRad = (75 / 2) * (Math.PI / 180);
    const halfH = Math.tan(fovHalfRad) * camZ * 1.2; // 20% bleed margin for edge coverage
    const halfW = halfH * aspect * 1.1;

    // Two mirrored bands: each band covers the outer 45% of the frustum height,
    // leaving the centre clear so the content can breathe.
    const bandDepth = halfH * 0.6;
    const innerEdge = halfH - bandDepth; // distance from camY where each band starts

    const halfCount = Math.floor(count / 2);
    const cols = this.GRID_X;
    const rowsPerBand = Math.ceil(halfCount / cols);

    let idx = 0;
    for (let band = 0; band < 2; band++) {
      const sign = band === 0 ? 1.0 : -1.0; // +1 = top, -1 = bottom
      for (let r = 0; r < rowsPerBand && idx < count; r++) {
        const v = r / rowsPerBand;
        // v=0 → inner edge of band (near centre), v=1 → outer screen edge
        const py = camY + sign * (innerEdge + v * bandDepth);
        for (let c = 0; c < cols && idx < count; c++) {
          const u = c / cols;
          const px = camX + (u - 0.5) * 2 * halfW;
          const seed = Math.random();
          const jx = (seed - 0.5) * 0.08;
          const jy = (Math.sin(seed * 12.345) - 0.5) * 0.08;
          const i3 = idx * 3;
          positions[i3]     = px + jx;
          positions[i3 + 1] = py + jy;
          seeds[idx] = seed;
          idx++;
        }
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

    const isDark = this.themeService.darkMode();
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color(isDark ? 0xBF00FF : 0xBC13FE ) },
        uColorB: { value: new THREE.Color(isDark ? 0xBC13FE  : 0xBF00FF) },
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
        varying float vGlow;

        float hash(float n) { return fract(sin(n) * 43758.5453123); }

        void main() {
          vec3 p = position;

          float t = uTime;
          float s = aSeed;

          // Two-wave interference with per-point randomness.
          float w1 = sin(p.x * 3.6 + t * 1.35 + s * 6.2831) * (0.18 + hash(s * 11.1) * 0.10);
          float w2 = sin(p.y * 4.1 - t * 1.10 + s * 12.0) * (0.12 + hash(s * 19.7) * 0.08);
          float wave = w1 + w2;

          p.z += wave;

          vec4 mvPosition = modelViewMatrix * vec4(p, 0.75);
          gl_Position = projectionMatrix * mvPosition;

          vec2 ndc = gl_Position.xy / gl_Position.w;
          float dist = distance(ndc, uMouse);
          float hover = smoothstep(uHoverRadius, 0.0, dist);

          // Subtle ripple that follows the pointer.
          float ripple = sin(dist * 18.0 - t * 4.2) * exp(-dist * 5.5) * 0.18;
          mvPosition.z += ripple;

          gl_Position = projectionMatrix * mvPosition;

          float perspective = 1.0 / max(0.001, -mvPosition.z);
          float pulse = sin(t * 10.4 + s * 6.2831) * 0.5 + 0.5;

          float size = uBaseSize * (0.85 + pulse * 0.55);
          size *= (1.0 + hover * 0.65);
          gl_PointSize = min(size * uPixelRatio * perspective, 30.0);

          vHover = hover;
          vGlow = 0.55 + pulse * 0.35 + hover * 0.75;
        }
      `,
      fragmentShader: `
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform float uIsDark;

        varying float vHover;
        varying float vGlow;

        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;

          float core = smoothstep(0.18, 0.0, d);
          float halo = smoothstep(0.5, 0.14, d);

          vec3 base = mix(uColorA, uColorB, core);
          vec3 highlight = mix(base, vec3(1.0), (uIsDark > 0.5) ? 0.75 : 0.25);
          vec3 color = mix(base, highlight, core);

          float alphaBase = (uIsDark > 0.5)
            ? (halo * 0.70 + core * 0.90)
            : (halo * 0.65 + core * 0.90);

          float alpha = alphaBase * vGlow * (0.62 + vHover * 0.25);
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  private animate(): void {
    if (!this.renderer || !this.scene || !this.camera || !this.particles || !this.timer) return;
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    this.timer.update();
    const elapsed = this.timer.getElapsed();

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

  onResize(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.renderer || !this.camera || !this.particles) return;

    const { width, height, aspect } = this.getCanvasMetrics();
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.particles.material.uniforms['uPixelRatio'].value = Math.min(window.devicePixelRatio, 2);
  }

  private getCanvasMetrics(): { width: number; height: number; aspect: number } {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width || canvas.clientWidth || 1));
    const height = Math.max(1, Math.floor(rect.height || canvas.clientHeight || 1));
    return { width, height, aspect: width / height };
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
    this.pendingPointer = undefined;
    this.pointerInside = false;
  }

  ngOnDestroy(): void {}
}

