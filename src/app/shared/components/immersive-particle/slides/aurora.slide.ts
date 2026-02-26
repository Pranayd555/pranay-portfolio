import { ParticleSlideBase, ParticleSimContext } from './particle-slide.base';
import { N } from '../particle.constants';

/**
 * Slide 1 (About) — sinusoidal wave field (aurora borealis).
 *
 * Particles ride a horizontally scrolling sine wave while the mouse
 * creates a vortex swirl on proximity.
 */
export class AuroraSlide extends ParticleSlideBase {
  override layout(ctx: ParticleSimContext): void {
    for (let i = 0; i < N; i++) {
      const i3 = i * 3;
      const x  = (Math.random() - 0.5) * 1100;
      const z  = (Math.random() - 0.5) * 220;
      const y  = Math.sin(x * 0.018 + ctx.phase[i]) * 130 + (Math.random() - 0.5) * 90;
      ctx.ori[i3]     = x;
      ctx.ori[i3 + 1] = y;
      ctx.ori[i3 + 2] = z;
    }
  }

  override simulate(t: number, ctx: ParticleSimContext): void {
    const { pos, vel, phase, mx, my } = ctx;
    const VORTEX_R  = 200;
    const VORTEX_R2 = VORTEX_R * VORTEX_R;
    const DAMP      = 0.925;

    for (let i = 0; i < N; i++) {
      const i3 = i * 3;
      let px = pos[i3],     py = pos[i3 + 1], pz = pos[i3 + 2];
      let vx = vel[i3],     vy = vel[i3 + 1], vz = vel[i3 + 2];

      const waveY = Math.sin(px * 0.017 + t * 0.55 + phase[i]) * 130;
      vy += (waveY - py) * 0.018;
      vx += Math.sin(t * 0.38 + phase[i] * 0.8) * 0.06;

      const dx = px - mx, dy = py - my, d2 = dx * dx + dy * dy;
      if (d2 < VORTEX_R2 && d2 > 0.5) {
        const d = Math.sqrt(d2);
        const s = (1 - d / VORTEX_R) * 4.5;
        vx += (-dy / d) * s;
        vy += (dx  / d) * s;
      }

      // Wrap horizontally for endless ribbon effect
      if (px >  560) px = -560;
      if (px < -560) px =  560;

      vx *= DAMP; vy *= DAMP; vz *= DAMP;

      pos[i3]     = px + vx;
      pos[i3 + 1] = py + vy;
      pos[i3 + 2] = pz + vz;
      vel[i3]     = vx;
      vel[i3 + 1] = vy;
      vel[i3 + 2] = vz;
    }
  }
}
