import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  InputSignal,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  afterNextRender,
  effect,
  inject,
  input,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';

import { N, SLIDE_COLORS } from './particle.constants';
import { VERTEX_SHADER, FRAGMENT_SHADER } from './particle.shaders';
import { ParticleSlideBase, ParticleSimContext } from './slides/particle-slide.base';
import { NebulaSlide }      from './slides/nebula.slide';
import { AuroraSlide }      from './slides/aurora.slide';
import { StarfieldSlide }   from './slides/starfield.slide';
import { WaveGridSlide }    from './slides/wave-grid.slide';
import { HandshakeSlide }   from './slides/handshake.slide';
import { TextParticleSlide } from './slides/text-particle.slide';

/**
 * ImmersiveParticleComponent — Three.js particle canvas orchestrator.
 *
 * Owns the shared scene, camera, renderer, and main particle buffer.
 * Each slide's behavior is delegated to a typed ParticleSlideBase plugin:
 *
 *   Slide 0 Hero       → NebulaSlide + TextParticleSlide
 *   Slide 1 About      → AuroraSlide
 *   Slide 2 Projects   → StarfieldSlide
 *   Slide 3 Experience → WaveGridSlide
 *   Slide 4 Contact    → HandshakeSlide
 */
@Component({
  selector: 'app-immersive-particle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(mousemove)': 'onMouseMove($event)',
    '(window:resize)': 'onResize()',
    '(click)': 'onHostClick()',
  },
  template: `<canvas #canvas class="absolute inset-0 w-full h-full"></canvas>`,
  styles: [`:host { display: block; position: absolute; inset: 0; pointer-events: all; }`],
})
export class ImmersiveParticleComponent implements OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  slideIndex: InputSignal<number> = input<number>(0);

  // ── DI ────────────────────────────────────────────────────────────────────
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  // ── Three.js core ──────────────────────────────────────────────────────────
  private scene!:    THREE.Scene;
  private camera!:   THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private points!:   THREE.Points;
  private geometry!: THREE.BufferGeometry;
  private clock      = new THREE.Clock();
  private raf?: number;
  private ready      = false;

  // ── Shared simulation buffers ──────────────────────────────────────────────
  private readonly pos   = new Float32Array(N * 3);
  private readonly vel   = new Float32Array(N * 3);
  private readonly ori   = new Float32Array(N * 3);
  private readonly phase = new Float32Array(N);

  // ── Mouse (world-space, smoothed) ─────────────────────────────────────────
  private mx    = 0;
  private my    = 0;
  private rawMx = 0;
  private rawMy = 0;

  // ── Color transition ───────────────────────────────────────────────────────
  private currentColor = new THREE.Color(SLIDE_COLORS[0]);
  private targetColor  = new THREE.Color(SLIDE_COLORS[0]);

  // ── Slide plugins ──────────────────────────────────────────────────────────
  private readonly nebulaSlide    = new NebulaSlide();
  private readonly auroraSlide    = new AuroraSlide();
  private readonly starfieldSlide = new StarfieldSlide();
  private readonly waveGridSlide  = new WaveGridSlide();
  private readonly handshakeSlide = new HandshakeSlide();
  private readonly textSlide      = new TextParticleSlide();

  /**
   * Maps slide index → active plugins.
   * Plugins receive layout/simulate/onFrame calls while their slide is active.
   */
  private readonly slidePlugins: ReadonlyArray<ReadonlyArray<ParticleSlideBase>> = [
    [this.nebulaSlide, this.textSlide], // 0 Hero
    [this.auroraSlide],                 // 1 About
    [this.starfieldSlide],              // 2 Projects
    [this.waveGridSlide],               // 3 Experience
    [this.handshakeSlide],              // 4 Contact
  ];

  private behavior = 0;

  constructor() {
    effect(() => {
      const idx = this.slideIndex();
      this.behavior = idx;
      this.targetColor.set(SLIDE_COLORS[idx] ?? SLIDE_COLORS[0]);
      if (this.ready) this.resetLayout(idx);
    });

    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.initThree();
        this.ready = true;
        this.animate();
      }
    });

    this.destroyRef.onDestroy(() => this.cleanup());
  }

  // ── Initialisation ─────────────────────────────────────────────────────────

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    const w = window.innerWidth, h = window.innerHeight;

    this.scene  = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 3000);
    this.camera.position.z = 650;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    for (let i = 0; i < N; i++) this.phase[i] = Math.random() * Math.PI * 2;

    this.geometry = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(this.pos, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    this.geometry.setAttribute('position', posAttr);
    this.geometry.setAttribute('aPhase', new THREE.BufferAttribute(this.phase, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uColor:      { value: new THREE.Color(SLIDE_COLORS[0]) },
        uTime:       { value: 0 },
        uSize:       { value: 7.5 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader:   VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
    });

    this.points = new THREE.Points(this.geometry, mat);
    this.scene.add(this.points);

    const threeCtx = { scene: this.scene, clock: this.clock, camera: this.camera };
    for (const plugins of this.slidePlugins) {
      for (const plugin of plugins) plugin.init(threeCtx);
    }

    this.resetLayout(0);
    this.pos.set(this.ori);
  }

  // ── Layout ─────────────────────────────────────────────────────────────────

  private resetLayout(idx: number): void {
    const t   = this.clock.getElapsedTime();
    const ctx = this.buildSimContext();

    // Hide all secondary objects, then show only the active slide's
    for (const plugins of this.slidePlugins) {
      for (const plugin of plugins) plugin.setVisible(false);
    }
    for (const plugin of this.slidePlugins[idx] ?? []) {
      plugin.setVisible(true);
      plugin.onActivate(t);
    }

    // Main shared Points: hidden for slide 2 (starfield) and 3 (wave grid)
    if (this.points) this.points.visible = (idx !== 2 && idx !== 3);

    // Restore camera to center when leaving the starfield slide
    if (idx !== 2 && this.camera) {
      this.camera.position.x = 0;
      this.camera.position.y = 0;
    }

    // Let each active plugin write its target positions into ori
    for (const plugin of this.slidePlugins[idx] ?? []) {
      plugin.layout(ctx);
    }

    this.vel.fill(0);

    if (this.points?.material instanceof THREE.ShaderMaterial) {
      const sizes = [7.5, 6.5, 7.0, 5.5, 8.0];
      this.points.material.uniforms['uSize'].value = sizes[idx] ?? 7.5;
    }
  }

  // ── RAF Loop ───────────────────────────────────────────────────────────────

  private animate(): void {
    if (!this.renderer) return;
    this.raf = requestAnimationFrame(() => this.animate());
    const t   = this.clock.getElapsedTime();
    const ctx = this.buildSimContext();

    // Smooth mouse
    this.mx += (this.rawMx - this.mx) * 0.10;
    this.my += (this.rawMy - this.my) * 0.10;

    const mainMat = this.points?.material instanceof THREE.ShaderMaterial
      ? this.points.material
      : null;

    for (const plugin of this.slidePlugins[this.behavior] ?? []) {
      plugin.simulate(t, ctx);
      plugin.onFrame(t, ctx, mainMat);
    }

    if (this.behavior !== 2 && this.behavior !== 3) {
      // Main shared particle buffer needs CPU → GPU upload
      this.currentColor.lerp(this.targetColor, 0.028);
      if (mainMat) {
        mainMat.uniforms['uTime'].value  = t;
        mainMat.uniforms['uColor'].value.copy(this.currentColor);
      }
      (this.geometry.attributes['position'] as THREE.BufferAttribute).needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  onMouseMove(e: MouseEvent): void {
    const halfH = Math.tan((60 * Math.PI) / 360) * 650;
    const halfW = halfH * (window.innerWidth / window.innerHeight);
    this.rawMx  = (e.clientX  / window.innerWidth  - 0.5) *  2 * halfW;
    this.rawMy  = -(e.clientY / window.innerHeight - 0.5) *  2 * halfH;
  }

  onResize(): void {
    if (!this.renderer || !this.camera) return;
    const w = window.innerWidth, h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const dpr = Math.min(window.devicePixelRatio, 2);
    if (this.points?.material instanceof THREE.ShaderMaterial) {
      this.points.material.uniforms['uPixelRatio'].value = dpr;
    }
    for (const plugins of this.slidePlugins) {
      for (const plugin of plugins) plugin.onResize(dpr);
    }
  }

  onHostClick(): void {
    if (this.behavior === 0) this.textSlide.triggerExplosion();
  }

  // ── Cleanup ────────────────────────────────────────────────────────────────

  private cleanup(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.geometry?.dispose();
    if (this.points?.material instanceof THREE.ShaderMaterial) {
      this.points.material.dispose();
    }
    for (const plugins of this.slidePlugins) {
      for (const plugin of plugins) plugin.dispose();
    }
    this.renderer?.dispose();
    this.scene?.clear();
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private buildSimContext(): ParticleSimContext {
    return {
      pos:   this.pos,
      vel:   this.vel,
      ori:   this.ori,
      phase: this.phase,
      mx:    this.mx,
      my:    this.my,
    };
  }

  ngOnDestroy(): void {}
}
