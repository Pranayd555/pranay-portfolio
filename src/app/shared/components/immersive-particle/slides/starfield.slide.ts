import * as THREE from 'three';
import { ParticleSlideBase, ParticleSimContext, ThreeInitContext } from './particle-slide.base';
import {
  N_STARS, STAR_BOX_X, STAR_BOX_Y, STAR_Z_NEAR, STAR_Z_FAR,
} from '../particle.constants';
import { STAR_VERTEX_SHADER, STAR_FRAGMENT_SHADER } from '../particle.shaders';

/**
 * Slide 2 (Projects) — deep-space warp starfield.
 *
 * Fully self-contained: owns its own buffers, geometry, material, and Points.
 * The shared main particle system is hidden while this slide is active.
 *
 * Auto-warp bursts every 12 s; entry always triggers an initial warp.
 */
export class StarfieldSlide extends ParticleSlideBase {
  private starfield!: THREE.Points;
  private starfieldGeo!: THREE.BufferGeometry;
  private camera!: THREE.PerspectiveCamera;

  private readonly starPositions = new Float32Array(N_STARS * 3);
  private readonly starColors    = new Float32Array(N_STARS * 3);

  private warpCurrent  = 0;
  private warpTarget   = 0;
  private lastAutoWarp = 0;

  override init(ctx: ThreeInitContext): void {
    this.camera = ctx.camera;
    const zRange = STAR_Z_NEAR - STAR_Z_FAR;

    for (let i = 0; i < N_STARS; i++) {
      const i3 = i * 3;
      this.starPositions[i3]     = (Math.random() - 0.5) * STAR_BOX_X * 2;
      this.starPositions[i3 + 1] = (Math.random() - 0.5) * STAR_BOX_Y * 2;
      this.starPositions[i3 + 2] = STAR_Z_FAR + Math.random() * zRange;

      // Color distribution: 50% white, 30% soft blue, 20% purple
      const r = Math.random();
      if (r < 0.50) {
        this.starColors[i3]     = 0.95;
        this.starColors[i3 + 1] = 0.97;
        this.starColors[i3 + 2] = 1.0;
      } else if (r < 0.80) {
        this.starColors[i3]     = 0.35 + Math.random() * 0.2;
        this.starColors[i3 + 1] = 0.60 + Math.random() * 0.2;
        this.starColors[i3 + 2] = 1.0;
      } else {
        this.starColors[i3]     = 0.60 + Math.random() * 0.3;
        this.starColors[i3 + 1] = 0.20 + Math.random() * 0.2;
        this.starColors[i3 + 2] = 0.90 + Math.random() * 0.1;
      }
    }

    this.starfieldGeo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(this.starPositions, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    this.starfieldGeo.setAttribute('position', posAttr);
    this.starfieldGeo.setAttribute('aStarColor', new THREE.BufferAttribute(this.starColors, 3));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uWarp:       { value: 0.0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader:   STAR_VERTEX_SHADER,
      fragmentShader: STAR_FRAGMENT_SHADER,
      transparent: true,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
    });

    this.starfield = new THREE.Points(this.starfieldGeo, mat);
    this.starfield.visible = false;
    ctx.scene.add(this.starfield);
  }

  override onActivate(t: number): void {
    this.warpTarget   = 1.0;
    this.lastAutoWarp = t;
  }

  override simulate(t: number, _ctx: ParticleSimContext): void {
    // Auto-warp burst every 12 s
    if (t - this.lastAutoWarp > 12) {
      this.warpTarget   = 1.0;
      this.lastAutoWarp = t;
    }

    this.warpCurrent += (this.warpTarget - this.warpCurrent) * 0.04;
    this.warpTarget  *= 0.97;

    const speed = 1.8 * (1.0 + this.warpCurrent * 20.0);

    for (let i = 0; i < N_STARS; i++) {
      const i3 = i * 3;
      this.starPositions[i3 + 2] += speed;

      if (this.starPositions[i3 + 2] > STAR_Z_NEAR) {
        this.starPositions[i3]     = (Math.random() - 0.5) * STAR_BOX_X * 2;
        this.starPositions[i3 + 1] = (Math.random() - 0.5) * STAR_BOX_Y * 2;
        this.starPositions[i3 + 2] = STAR_Z_FAR + Math.random() * 100;
      }
    }

    // Subtle camera drift for immersive depth
    if (this.camera) {
      this.camera.position.x = Math.sin(t * 0.11) * 18;
      this.camera.position.y = Math.cos(t * 0.07) * 10;
    }
  }

  override onFrame(_t: number, _ctx: ParticleSimContext, _mainMat: THREE.ShaderMaterial | null): void {
    if (this.starfield?.material instanceof THREE.ShaderMaterial) {
      this.starfield.material.uniforms['uWarp'].value = this.warpCurrent;
    }
    (this.starfieldGeo.attributes['position'] as THREE.BufferAttribute).needsUpdate = true;
  }

  override setVisible(visible: boolean): void {
    if (this.starfield) this.starfield.visible = visible;
  }

  override onResize(dpr: number): void {
    if (this.starfield?.material instanceof THREE.ShaderMaterial) {
      this.starfield.material.uniforms['uPixelRatio'].value = dpr;
    }
  }

  override dispose(): void {
    this.starfieldGeo?.dispose();
    if (this.starfield?.material instanceof THREE.ShaderMaterial) {
      this.starfield.material.dispose();
    }
  }
}
