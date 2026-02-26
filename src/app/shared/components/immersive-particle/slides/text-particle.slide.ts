import * as THREE from 'three';
import { ParticleSlideBase, ParticleSimContext, ThreeInitContext } from './particle-slide.base';
import { N_TEXT_MAX } from '../particle.constants';
import { TEXT_VERTEX_SHADER, TEXT_FRAGMENT_SHADER } from '../particle.shaders';

type TextState = 'forming' | 'formed' | 'exploding' | 'returning';

/**
 * Slide 0 (Hero) — "PRANAV DAS" text particle system.
 *
 * Fully self-contained: samples pixels from an offscreen canvas, owns its own
 * position / velocity / origin buffers and Three.js Points object.
 *
 * Lifecycle: forming → formed (6 s hold) → exploding → returning → formed…
 * Clicking the canvas triggers an explosion at any time.
 */
export class TextParticleSlide extends ParticleSlideBase {
  private textPoints!: THREE.Points;
  private textGeo!: THREE.BufferGeometry;

  private readonly textPos   = new Float32Array(N_TEXT_MAX * 3);
  private readonly textVel   = new Float32Array(N_TEXT_MAX * 3);
  private readonly textOri   = new Float32Array(N_TEXT_MAX * 3);
  private readonly textPhase = new Float32Array(N_TEXT_MAX);

  private textCount     = 0;
  private textState: TextState = 'forming';
  private textStateTimer       = 0;

  private clock!: THREE.Clock;

  override init(ctx: ThreeInitContext): void {
    this.clock = ctx.clock;
    this.sampleTextPixels();
    this.buildGeometry(ctx.scene);
  }

  /** Scatter text particles and start the forming animation. */
  override onActivate(_t: number): void {
    if (!this.textCount) return;
    for (let i = 0; i < this.textCount; i++) {
      const i3 = i * 3;
      this.textPos[i3]     = (Math.random() - 0.5) * 900;
      this.textPos[i3 + 1] = (Math.random() - 0.5) * 600;
      this.textPos[i3 + 2] = (Math.random() - 0.5) * 500;
      this.textVel[i3]     = 0;
      this.textVel[i3 + 1] = 0;
      this.textVel[i3 + 2] = 0;
    }
    this.textState      = 'forming';
    this.textStateTimer = this.clock.getElapsedTime();
  }

  override simulate(t: number, _ctx: ParticleSimContext): void {
    if (!this.textCount) return;

    const elapsed = t - this.textStateTimer;

    if (this.textState === 'exploding' && elapsed > 1.4) {
      this.textState      = 'returning';
      this.textStateTimer = t;
    }
    if (this.textState === 'formed' && elapsed > 6.0) {
      this.triggerExplosion();
    }

    let SPRING: number;
    let DAMP:   number;
    switch (this.textState) {
      case 'forming':   SPRING = 0.030; DAMP = 0.88; break;
      case 'formed':    SPRING = 0.045; DAMP = 0.85; break;
      case 'exploding': SPRING = 0.000; DAMP = 0.96; break;
      case 'returning': SPRING = 0.048; DAMP = 0.84; break;
    }

    let totalDist = 0;

    for (let i = 0; i < this.textCount; i++) {
      const i3 = i * 3;
      let px = this.textPos[i3],     py = this.textPos[i3 + 1], pz = this.textPos[i3 + 2];
      let vx = this.textVel[i3],     vy = this.textVel[i3 + 1], vz = this.textVel[i3 + 2];
      const ox = this.textOri[i3], oy = this.textOri[i3 + 1], oz = this.textOri[i3 + 2];

      if (this.textState !== 'exploding') {
        vx += (ox - px) * SPRING;
        vy += (oy - py) * SPRING;
        vz += (oz - pz) * SPRING;

        if (this.textState === 'formed') {
          vx += Math.sin(t * 0.5 + this.textPhase[i]) * 0.04;
          vy += Math.cos(t * 0.4 + this.textPhase[i] * 1.3) * 0.03;
        }
        totalDist += Math.abs(ox - px) + Math.abs(oy - py);
      }

      vx *= DAMP; vy *= DAMP; vz *= DAMP;
      this.textPos[i3]     = px + vx;
      this.textPos[i3 + 1] = py + vy;
      this.textPos[i3 + 2] = pz + vz;
      this.textVel[i3]     = vx;
      this.textVel[i3 + 1] = vy;
      this.textVel[i3 + 2] = vz;
    }

    if ((this.textState === 'forming' || this.textState === 'returning')
        && totalDist / this.textCount < 3.0) {
      this.textState      = 'formed';
      this.textStateTimer = t;
    }

    if (this.textPoints?.material instanceof THREE.ShaderMaterial) {
      this.textPoints.material.uniforms['uTime'].value = t;
    }
  }

  override onFrame(_t: number, _ctx: ParticleSimContext, _mainMat: THREE.ShaderMaterial | null): void {
    if (this.textGeo) {
      (this.textGeo.attributes['position'] as THREE.BufferAttribute).needsUpdate = true;
    }
  }

  /** Burst all text particles outward. Called on click or after the 6 s hold. */
  triggerExplosion(): void {
    if (this.textState === 'exploding') return;
    for (let i = 0; i < this.textCount; i++) {
      const i3    = i * 3;
      const px    = this.textPos[i3];
      const py    = this.textPos[i3 + 1];
      const angle = Math.atan2(py, px) + (Math.random() - 0.5) * 1.6;
      const speed = 4.0 + Math.random() * 14.0;
      this.textVel[i3]     = Math.cos(angle) * speed;
      this.textVel[i3 + 1] = Math.sin(angle) * speed;
      this.textVel[i3 + 2] = (Math.random() - 0.5) * 10.0;
    }
    this.textState      = 'exploding';
    this.textStateTimer = this.clock.getElapsedTime();
  }

  override setVisible(visible: boolean): void {
    if (this.textPoints) this.textPoints.visible = visible;
  }

  override onResize(dpr: number): void {
    if (this.textPoints?.material instanceof THREE.ShaderMaterial) {
      this.textPoints.material.uniforms['uPixelRatio'].value = dpr;
    }
  }

  override dispose(): void {
    this.textGeo?.dispose();
    if (this.textPoints?.material instanceof THREE.ShaderMaterial) {
      this.textPoints.material.dispose();
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private sampleTextPixels(): void {
    const cvs = document.createElement('canvas');
    cvs.width  = 800;
    cvs.height = 160;
    const ctx2d = cvs.getContext('2d')!;

    ctx2d.clearRect(0, 0, cvs.width, cvs.height);
    ctx2d.fillStyle    = 'white';
    ctx2d.font         = 'bold 110px "Space Grotesk", Arial, sans-serif';
    ctx2d.textAlign    = 'center';
    ctx2d.textBaseline = 'middle';
    ctx2d.fillText('PRANAV DAS', cvs.width / 2, cvs.height / 2);

    const imageData = ctx2d.getImageData(0, 0, cvs.width, cvs.height).data;
    const sampled: number[][] = [];

    for (let y = 0; y < cvs.height; y += 3) {
      for (let x = 0; x < cvs.width; x += 3) {
        if (imageData[(y * cvs.width + x) * 4 + 3] > 100) {
          sampled.push([x, y]);
        }
      }
    }

    // Shuffle for organic formation order
    for (let i = sampled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sampled[i], sampled[j]] = [sampled[j], sampled[i]];
    }

    this.textCount = Math.min(sampled.length, N_TEXT_MAX);

    for (let i = 0; i < this.textCount; i++) {
      const [px, py] = sampled[i];
      const i3 = i * 3;
      this.textOri[i3]     = (px / cvs.width  - 0.5) * 760;
      this.textOri[i3 + 1] = -(py / cvs.height - 0.5) * 140 + 20;
      this.textOri[i3 + 2] = (Math.random() - 0.5) * 12;
      this.textPhase[i]    = Math.random() * Math.PI * 2;
    }
  }

  private buildGeometry(scene: THREE.Scene): void {
    this.textGeo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(this.textPos, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    this.textGeo.setAttribute('position', posAttr);
    this.textGeo.setAttribute('aPhase', new THREE.BufferAttribute(this.textPhase, 1));
    this.textGeo.setDrawRange(0, this.textCount);

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:       { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uColorA:     { value: new THREE.Color(0x00f3ff) }, // cyan
        uColorB:     { value: new THREE.Color(0x9966ff) }, // violet
      },
      vertexShader:   TEXT_VERTEX_SHADER,
      fragmentShader: TEXT_FRAGMENT_SHADER,
      transparent: true,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
    });

    this.textPoints = new THREE.Points(this.textGeo, mat);
    this.textPoints.visible = false;
    scene.add(this.textPoints);
  }
}
