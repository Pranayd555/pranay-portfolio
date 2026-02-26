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

interface SlideTheme {
  color: number;
  glowColor: number;
  speed: number;
  size: number;
  rotationX: number;
  rotationY: number;
  blending: THREE.Blending;
}

const SLIDE_THEMES: SlideTheme[] = [
  { color: 0x00f3ff, glowColor: 0x00f3ff, speed: 0.8, size: 9, rotationX: 0.0005, rotationY: 0.0012, blending: THREE.AdditiveBlending },   // Hero – cyan
  { color: 0xf3a000, glowColor: 0xf3a000, speed: 0.4, size: 7, rotationX: 0.0003, rotationY: 0.0008, blending: THREE.AdditiveBlending },   // About – warm gold
  { color: 0x135bec, glowColor: 0x4488ff, speed: 1.1, size: 6, rotationX: 0.0007, rotationY: 0.0015, blending: THREE.AdditiveBlending },   // Projects – electric blue
  { color: 0xbc13fe, glowColor: 0xbc13fe, speed: 0.7, size: 8, rotationX: 0.0008, rotationY: 0.001,  blending: THREE.AdditiveBlending },   // Experience – purple
  { color: 0xff00ff, glowColor: 0xff66ff, speed: 1.3, size: 5, rotationX: 0.001,  rotationY: 0.002,  blending: THREE.AdditiveBlending },   // Contact – magenta
];

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

  slideIndex: InputSignal<number> = input<number>(0);

  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private particles!: THREE.Points;
  private animationFrameId?: number;
  private clock = new THREE.Clock();

  private currentColor = new THREE.Color(0x00f3ff);
  private targetColor = new THREE.Color(0x00f3ff);
  private currentSpeed = 0.8;
  private targetSpeed = 0.8;
  private currentRotX = 0.0005;
  private currentRotY = 0.0012;

  private readonly NUM_PARTICLES = 180;
  private readonly RINGS = 16;
  private readonly SPHERE_RADIUS = 320;

  constructor() {
    effect(() => {
      const idx = this.slideIndex();
      const theme = SLIDE_THEMES[idx] ?? SLIDE_THEMES[0];
      this.targetColor.set(theme.color);
      this.targetSpeed = theme.speed;
      this.currentRotX = theme.rotationX;
      this.currentRotY = theme.rotationY;

      if (this.particles?.material instanceof THREE.ShaderMaterial) {
        this.particles.material.uniforms['uSize'].value = theme.size;
        this.particles.material.blending = theme.blending;
      }
    });

    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.initThree();
        this.animate();
      }
    });

    this.destroyRef.onDestroy(() => this.cleanup());
  }

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    this.scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 3000);
    this.camera.position.z = 700;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.createParticles();
    this.updateScale();
  }

  private createParticles(): void {
    const positions: number[] = [];
    const offsets: number[] = [];

    const phiStart = 0.15;
    const phiEnd = Math.PI - 0.15;
    const phiRange = phiEnd - phiStart;
    const ringStep = phiRange / (this.RINGS - 1);
    const pointsPerRing = Math.ceil(this.NUM_PARTICLES / this.RINGS);

    let index = 0;
    for (let i = 0; i < this.RINGS; i++) {
      const phi = phiStart + i * ringStep;
      const y = this.SPHERE_RADIUS * Math.cos(phi);
      const r = this.SPHERE_RADIUS * Math.sin(phi);
      const stagger = (i % 2) * (Math.PI / pointsPerRing);

      for (let j = 0; j < pointsPerRing && index < this.NUM_PARTICLES; j++) {
        const theta = (j / pointsPerRing) * Math.PI * 2 + stagger;
        positions.push(r * Math.cos(theta), y, r * Math.sin(theta));
        offsets.push((i / this.RINGS) + (j / pointsPerRing));
        index++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('aOffset', new THREE.Float32BufferAttribute(offsets, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime:       { value: 0 },
        uColor:      { value: new THREE.Color(0x00f3ff) },
        uSize:       { value: 9 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uSize;
        uniform float uPixelRatio;
        attribute float aOffset;
        varying float vGlow;

        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float glow = sin(uTime * 1.2 + aOffset * 6.28318) * 0.5 + 0.5;
          vGlow = glow;
          float pulseSize = uSize * (1.1 + glow * 0.4);
          float perspectiveSize = pulseSize * (600.0 / -mvPosition.z);
          gl_PointSize = min(perspectiveSize * uPixelRatio, 55.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vGlow;

        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float core = smoothstep(0.17, 0.07, d);
          float outerGlow = smoothstep(0.5, 0.1, d);
          vec3 highlight = mix(uColor, vec3(1.0), 0.55);
          vec3 finalColor = mix(uColor, highlight, core);
          float alpha = mix(outerGlow * 0.35, core * 1.0, 0.45);
          alpha *= (0.85 + vGlow * 0.15);
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  private animate(): void {
    if (!this.renderer || !this.scene || !this.camera) return;
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    const elapsedTime = this.clock.getElapsedTime();

    // Smooth color lerp
    this.currentColor.lerp(this.targetColor, 0.025);
    this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.02;

    if (this.particles?.material instanceof THREE.ShaderMaterial) {
      this.particles.material.uniforms['uTime'].value = elapsedTime * this.currentSpeed;
      this.particles.material.uniforms['uColor'].value.copy(this.currentColor);
    }

    if (this.particles) {
      this.particles.rotation.y += this.currentRotY;
      this.particles.rotation.x += this.currentRotX;
    }

    this.renderer.render(this.scene, this.camera);
  }

  onResize(): void {
    if (!this.renderer || !this.camera) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if (this.particles?.material instanceof THREE.ShaderMaterial) {
      this.particles.material.uniforms['uPixelRatio'].value = Math.min(window.devicePixelRatio, 2);
    }
    this.updateScale();
  }

  private updateScale(): void {
    if (!this.particles) return;
    const minDim = Math.min(window.innerWidth, window.innerHeight);
    const scale = Math.max(200, minDim * 0.48) / this.SPHERE_RADIUS;
    this.particles.scale.set(scale, scale, scale);
  }

  private cleanup(): void {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.renderer) this.renderer.dispose();
    if (this.particles) {
      this.particles.geometry.dispose();
      (this.particles.material as THREE.Material).dispose();
    }
    this.scene?.clear();
  }

  ngOnDestroy(): void {}
}
