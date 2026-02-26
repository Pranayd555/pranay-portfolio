import * as THREE from 'three';
import { ParticleSlideBase, ParticleSimContext } from './particle-slide.base';
import { N, N_HAND, HAND_REGIONS } from '../particle.constants';

/**
 * Slide 4 (Contact) — Nokia-style particle handshake animation.
 *
 * Drives a 6-phase state machine on the shared main particle buffer:
 *
 *   0 FORM     (2.0 s) — particles spring into two hand silhouettes
 *   1 APPROACH (2.2 s) — hands glide toward each other (cubic ease-in-out)
 *   2 SHAKE    (0.9 s) — brief Y oscillation at near-touching point
 *   3 EXPLODE  (0.6 s) — radial burst; velocities set on phase entry
 *   4 DRIFT    (1.6 s) — free float; mouse acts as magnet + spiral
 *   5 REFORM   (2.2 s) — hands retreat to start offset; loop
 *
 * Particles 0..N_HAND-1        → left hand
 * Particles N_HAND..2*N_HAND-1 → right hand
 * Particles 2*N_HAND..N-1      → ambient background
 */
export class HandshakeSlide extends ParticleSlideBase {
  private handPhase      = 0;
  private handPhaseStart = 0;
  private handOffsetX    = 480;
  private handShakeY     = 0;

  private readonly handLocalL = new Float32Array(N_HAND * 3);
  private readonly handLocalR = new Float32Array(N_HAND * 3);

  private readonly PHASE_DUR = [2.0, 2.2, 0.9, 0.6, 1.6, 2.2];

  override layout(ctx: ParticleSimContext): void {
    this.buildHandShapes();
    this.handPhase   = 0;
    this.handOffsetX = 480;
    this.handShakeY  = 0;
    this.writeHandOrigins(ctx.ori);

    for (let i = N_HAND * 2; i < N; i++) {
      const i3 = i * 3;
      ctx.ori[i3]     = (Math.random() - 0.5) * 900;
      ctx.ori[i3 + 1] = (Math.random() - 0.5) * 500;
      ctx.ori[i3 + 2] = (Math.random() - 0.5) * 150;
    }
  }

  override onActivate(t: number): void {
    this.handPhaseStart = t;
  }

  override simulate(t: number, ctx: ParticleSimContext): void {
    const elapsed = t - this.handPhaseStart;
    if (elapsed >= this.PHASE_DUR[this.handPhase]) {
      this.advancePhase(t, ctx);
    }

    const pe = t - this.handPhaseStart;
    this.updateOffsets(pe);

    if (this.handPhase !== 3 && this.handPhase !== 4) {
      this.writeHandOrigins(ctx.ori);
    }

    const SPRINGS = [0.025, 0.075, 0.085, 0,     0.002, 0.030];
    const DAMPS   = [0.880, 0.860, 0.850, 0.965, 0.950, 0.880];
    const spring  = SPRINGS[this.handPhase];
    const damp    = DAMPS[this.handPhase];
    const { pos, vel, ori, phase, mx, my } = ctx;

    for (let i = 0; i < N; i++) {
      const i3 = i * 3;
      let px = pos[i3],     py = pos[i3 + 1], pz = pos[i3 + 2];
      let vx = vel[i3],     vy = vel[i3 + 1], vz = vel[i3 + 2];
      const ox = ori[i3], oy = ori[i3 + 1], oz = ori[i3 + 2];

      if (this.handPhase === 3) {
        // EXPLODE — let burst velocities play out under strong damping
      } else if (this.handPhase === 4) {
        vx += (ox - px) * spring;
        vy += (oy - py) * spring;

        const dx = mx - px, dy = my - py, d2 = dx * dx + dy * dy;
        if (d2 < 270 * 270 && d2 > 0.5) {
          const d = Math.sqrt(d2);
          const f = (1 - d / 270) * 3.8;
          vx += (dx / d) * f;
          vy += (dy / d) * f;
          // Spiral tangent
          vx += (-dy / d) * f * 0.22;
          vy += ( dx / d) * f * 0.22;
        }
      } else {
        vx += (ox - px) * spring;
        vy += (oy - py) * spring;
        vz += (oz - pz) * spring * 0.4;

        if (i >= N_HAND * 2) {
          vx += Math.sin(t * 0.25 + phase[i]) * 0.04;
          vy += Math.cos(t * 0.20 + phase[i]) * 0.03;
        }
      }

      vx *= damp; vy *= damp; vz *= damp;
      pos[i3]     = px + vx;
      pos[i3 + 1] = py + vy;
      pos[i3 + 2] = pz + vz;
      vel[i3]     = vx;
      vel[i3 + 1] = vy;
      vel[i3 + 2] = vz;
    }
  }

  /** Flash-boost uSize during the EXPLODE phase. */
  override onFrame(t: number, _ctx: ParticleSimContext, mainMat: THREE.ShaderMaterial | null): void {
    if (!mainMat) return;
    if (this.handPhase === 3) {
      const pe    = t - this.handPhaseStart;
      const flash = Math.max(0, 1 - pe / 0.35) * 4.0;
      mainMat.uniforms['uSize'].value = 8.0 + flash;
    } else {
      mainMat.uniforms['uSize'].value = 8.0;
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private updateOffsets(pe: number): void {
    switch (this.handPhase) {
      case 0:
        this.handOffsetX = 480;
        break;

      case 1: {
        const p = Math.min(pe / this.PHASE_DUR[1], 1.0);
        const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        this.handOffsetX = 480 - (480 - 88) * e;
        break;
      }

      case 2:
        this.handShakeY  = Math.sin(pe * 21) * 14;
        this.handOffsetX = 88 + Math.abs(Math.cos(pe * 10.5)) * 12;
        break;

      case 3:
        break;

      case 4:
        break;

      case 5: {
        const p = Math.min(pe / this.PHASE_DUR[5], 1.0);
        const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        this.handOffsetX = 90 + (480 - 90) * e;
        this.handShakeY  = 0;
        break;
      }
    }
  }

  private advancePhase(t: number, ctx: ParticleSimContext): void {
    this.handPhase      = (this.handPhase + 1) % 6;
    this.handPhaseStart = t;
    this.handShakeY     = 0;

    if (this.handPhase === 3) {
      for (let i = 0; i < N; i++) {
        const i3    = i * 3;
        const px    = ctx.pos[i3], py = ctx.pos[i3 + 1];
        const angle = Math.atan2(py, px) + (Math.random() - 0.5) * 1.8;
        const speed = 2.0 + Math.random() * 8.0;
        ctx.vel[i3]     = Math.cos(angle) * speed;
        ctx.vel[i3 + 1] = Math.sin(angle) * speed;
        ctx.vel[i3 + 2] = (Math.random() - 0.5) * 5.0;
      }
      for (let i = 0; i < N; i++) {
        const i3 = i * 3;
        ctx.ori[i3]     = (Math.random() - 0.5) * 720;
        ctx.ori[i3 + 1] = (Math.random() - 0.5) * 420;
        ctx.ori[i3 + 2] = (Math.random() - 0.5) * 130;
      }
    }

    if (this.handPhase === 5) {
      this.buildHandShapes();
      this.handOffsetX = 90;
      this.writeHandOrigins(ctx.ori);
    }

    if (this.handPhase === 0) {
      this.handOffsetX = 480;
      this.handShakeY  = 0;
      this.buildHandShapes();
      this.writeHandOrigins(ctx.ori);
      for (let i = N_HAND * 2; i < N; i++) {
        const i3 = i * 3;
        ctx.ori[i3]     = (Math.random() - 0.5) * 900;
        ctx.ori[i3 + 1] = (Math.random() - 0.5) * 500;
        ctx.ori[i3 + 2] = (Math.random() - 0.5) * 150;
      }
    }
  }

  private buildHandShapes(): void {
    let idx = 0;
    for (const [x0, x1, y0, y1, count] of HAND_REGIONS) {
      for (let k = 0; k < count; k++) {
        const i3 = idx * 3;
        const lx  = x0 + Math.random() * (x1 - x0);
        const ly  = y0 + Math.random() * (y1 - y0);
        const lz  = (Math.random() - 0.5) * 28;
        this.handLocalL[i3]     = lx;
        this.handLocalL[i3 + 1] = ly;
        this.handLocalL[i3 + 2] = lz;
        this.handLocalR[i3]     = -lx;
        this.handLocalR[i3 + 1] = ly;
        this.handLocalR[i3 + 2] = lz;
        idx++;
      }
    }
  }

  private writeHandOrigins(ori: Float32Array): void {
    const offX   = this.handOffsetX;
    const shakeY = this.handShakeY;
    for (let i = 0; i < N_HAND; i++) {
      const s3 = i * 3;
      ori[s3]     = this.handLocalL[s3]     - offX;
      ori[s3 + 1] = this.handLocalL[s3 + 1] + shakeY;
      ori[s3 + 2] = this.handLocalL[s3 + 2];
      const d3 = (N_HAND + i) * 3;
      ori[d3]     = this.handLocalR[s3]     + offX;
      ori[d3 + 1] = this.handLocalR[s3 + 1] + shakeY;
      ori[d3 + 2] = this.handLocalR[s3 + 2];
    }
  }
}
