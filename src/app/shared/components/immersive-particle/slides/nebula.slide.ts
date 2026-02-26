import { ParticleSlideBase, ParticleSimContext } from './particle-slide.base';
import { N } from '../particle.constants';

/**
 * Slide 0 (Hero) — dense volumetric sphere.
 *
 * Operates exclusively on the shared main particle buffers.
 * Mouse proximity causes a repulsion ripple through the cloud.
 */
export class NebulaSlide extends ParticleSlideBase {
  override layout(ctx: ParticleSimContext): void {
    const R = 380;
    for (let i = 0; i < N; i++) {
      const i3    = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = R * Math.cbrt(Math.random());
      ctx.ori[i3]     = r * Math.sin(phi) * Math.cos(theta);
      ctx.ori[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.85;
      ctx.ori[i3 + 2] = r * Math.cos(phi) * 0.50;
    }
  }

  override simulate(t: number, ctx: ParticleSimContext): void {
    const { pos, vel, ori, phase, mx, my } = ctx;
    const SPRING  = 0.022;
    const DAMP    = 0.89;
    const REPEL_R = 175;
    const REPEL_R2 = REPEL_R * REPEL_R;

    for (let i = 0; i < N; i++) {
      const i3 = i * 3;
      let px = pos[i3],     py = pos[i3 + 1], pz = pos[i3 + 2];
      let vx = vel[i3],     vy = vel[i3 + 1], vz = vel[i3 + 2];
      const ox = ori[i3], oy = ori[i3 + 1], oz = ori[i3 + 2];

      vx += (ox - px) * SPRING;
      vy += (oy - py) * SPRING;
      vz += (oz - pz) * SPRING;

      const dx = px - mx, dy = py - my, d2 = dx * dx + dy * dy;
      if (d2 < REPEL_R2 && d2 > 0.5) {
        const d = Math.sqrt(d2);
        const f = ((REPEL_R - d) / REPEL_R) * 10.5;
        vx += (dx / d) * f;
        vy += (dy / d) * f;
        vz += Math.sin(t * 1.2 + phase[i]) * f * 0.35;
      }

      vx += Math.sin(t * 0.07 + phase[i] * 0.6) * 0.10;
      vy += Math.cos(t * 0.09 + phase[i] * 0.4) * 0.08;
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
