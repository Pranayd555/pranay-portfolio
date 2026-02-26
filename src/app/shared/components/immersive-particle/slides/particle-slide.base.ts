import * as THREE from 'three';

/**
 * Shared simulation buffers passed every frame to all slide plugins.
 * Owned by ImmersiveParticleComponent; slides read and write into them.
 */
export interface ParticleSimContext {
  readonly pos:   Float32Array;
  readonly vel:   Float32Array;
  readonly ori:   Float32Array;
  readonly phase: Float32Array;
  readonly mx:    number;
  readonly my:    number;
}

/**
 * Three.js core objects provided to slide plugins during initialisation.
 */
export interface ThreeInitContext {
  scene:    THREE.Scene;
  clock:    THREE.Clock;
  camera:   THREE.PerspectiveCamera;
}

/**
 * Abstract base class for every slide particle system.
 *
 * Slides that operate on the **shared** main particle buffer (nebula, aurora,
 * handshake) implement `layout()` and `simulate()`.
 *
 * Slides that own **independent** Three.js objects (starfield, wave-grid, text)
 * implement `init()`, `onFrame()`, `setVisible()`, `onResize()`, and `dispose()`.
 *
 * All methods have default no-op implementations so subclasses only override
 * what they need.
 */
export abstract class ParticleSlideBase {
  /** Register secondary Three.js objects into the scene. Called once on init. */
  init(_ctx: ThreeInitContext): void {}

  /**
   * Write target positions (`ori`) for the shared main particle system.
   * Called once when this slide becomes active.
   */
  layout(_ctx: ParticleSimContext): void {}

  /** Called once when this slide becomes active — e.g. to set initial state. */
  onActivate(_t: number): void {}

  /** Advance the simulation for shared particles, called every frame. */
  simulate(_t: number, _ctx: ParticleSimContext): void {}

  /**
   * Per-frame update for slide-owned Three.js state (uniforms, GPU flags).
   * `mainMat` is the ShaderMaterial on the shared Points — may be null for
   * slides that don't use the shared system.
   */
  onFrame(_t: number, _ctx: ParticleSimContext, _mainMat: THREE.ShaderMaterial | null): void {}

  /** Show or hide slide-owned Three.js objects. */
  setVisible(_visible: boolean): void {}

  /** Update pixel ratio on viewport resize. */
  onResize(_dpr: number): void {}

  /** Dispose all Three.js resources owned by this slide. */
  dispose(): void {}
}
