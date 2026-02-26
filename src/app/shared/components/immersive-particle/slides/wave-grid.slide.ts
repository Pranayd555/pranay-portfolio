import * as THREE from 'three';
import { ParticleSlideBase, ParticleSimContext, ThreeInitContext } from './particle-slide.base';
import { GRID_COLS, GRID_ROWS, GRID_SPACING, N_GRID } from '../particle.constants';
import { WAVE_VERTEX_SHADER, WAVE_FRAGMENT_SHADER } from '../particle.shaders';

/**
 * Slide 3 (Experience) — GPU-driven wave terrain grid.
 *
 * All vertical displacement is computed in the vertex shader; the CPU only
 * updates time, amplitude, and mouse-position uniforms each frame.
 *
 * Amplitude auto-boosts every 10 s for a dramatic surge.
 */
export class WaveGridSlide extends ParticleSlideBase {
  private waveGrid!: THREE.Points;
  private waveGridGeo!: THREE.BufferGeometry;

  private waveAmplitudeCurrent = 40;
  private waveAmplitudeTarget  = 40;
  private lastWaveBoost        = 0;

  override init(ctx: ThreeInitContext): void {
    const positions = new Float32Array(N_GRID * 3);
    const halfW = ((GRID_COLS - 1) * GRID_SPACING) / 2;
    const halfD = ((GRID_ROWS - 1) * GRID_SPACING) / 2;

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const i3 = (row * GRID_COLS + col) * 3;
        positions[i3]     = col * GRID_SPACING - halfW;
        positions[i3 + 1] = 0;
        positions[i3 + 2] = row * GRID_SPACING - halfD;
      }
    }

    this.waveGridGeo = new THREE.BufferGeometry();
    this.waveGridGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:       { value: 0 },
        uAmplitude:  { value: 40 },
        uMouseX:     { value: 0 },
        uMouseZ:     { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader:   WAVE_VERTEX_SHADER,
      fragmentShader: WAVE_FRAGMENT_SHADER,
      transparent: true,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
    });

    this.waveGrid = new THREE.Points(this.waveGridGeo, mat);
    // Tilt the grid to give a perspective terrain / energy-field look
    this.waveGrid.rotation.x = -Math.PI * 0.32;
    this.waveGrid.position.y = -60;
    this.waveGrid.visible    = false;
    ctx.scene.add(this.waveGrid);
  }

  override onActivate(t: number): void {
    this.waveAmplitudeTarget = 90;
    this.lastWaveBoost       = t;
  }

  /** Uniforms-only update — vertex shader handles all positional math. */
  override simulate(t: number, ctx: ParticleSimContext): void {
    if (!(this.waveGrid?.material instanceof THREE.ShaderMaterial)) return;

    // Auto-boost every 10 s for dramatic surge
    if (t - this.lastWaveBoost > 10) {
      this.waveAmplitudeTarget = 90;
      this.lastWaveBoost       = t;
    }

    this.waveAmplitudeCurrent += (this.waveAmplitudeTarget - this.waveAmplitudeCurrent) * 0.035;
    this.waveAmplitudeTarget  += (40 - this.waveAmplitudeTarget) * 0.018;

    const u      = this.waveGrid.material.uniforms;
    const halfW  = ((GRID_COLS - 1) * GRID_SPACING) / 2;
    const halfD  = ((GRID_ROWS - 1) * GRID_SPACING) / 2;

    u['uTime'].value      = t;
    u['uAmplitude'].value = this.waveAmplitudeCurrent;
    u['uMouseX'].value    = ctx.mx * (halfW / 450);
    u['uMouseZ'].value    = -ctx.my * (halfD / 350);
  }

  override setVisible(visible: boolean): void {
    if (this.waveGrid) this.waveGrid.visible = visible;
  }

  override onResize(dpr: number): void {
    if (this.waveGrid?.material instanceof THREE.ShaderMaterial) {
      this.waveGrid.material.uniforms['uPixelRatio'].value = dpr;
    }
  }

  override dispose(): void {
    this.waveGridGeo?.dispose();
    if (this.waveGrid?.material instanceof THREE.ShaderMaterial) {
      this.waveGrid.material.dispose();
    }
  }
}
