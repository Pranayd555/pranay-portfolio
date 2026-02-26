---
name: threejs-architect
description: Designs, implements, and audits Three.js / WebGL scenes in this Angular 21 portfolio. Enforces SSR safety, resource cleanup, shader authoring, theme reactivity, and performance. Use when building or changing any Three.js component, canvas animation, GLSL shader, or WebGL renderer.
---

# Three.js Architect

## Project Context

- **Three.js**: 0.183.0 with `@types/three` 0.182.0
- **Angular**: 21 — standalone, zoneless, signals, OnPush
- **SSR**: `@angular/ssr` active — browser-only APIs must be guarded
- **Theme**: `ThemeService` exposes `darkMode()` as a Signal
- **Test runner**: Vitest with jsdom — mock WebGL for Three.js tests
- **Styling**: Tailwind CSS v4 — canvas positional styles via Tailwind classes

---

## Responsibilities

- Design Three.js scene architecture (scene, camera, renderer, objects, materials)
- Author and review GLSL vertex/fragment shaders
- Enforce SSR-safe initialization patterns
- Ensure full resource disposal on component destroy
- Integrate theme reactivity via Angular `effect()`
- Audit performance: RAF efficiency, particle count, buffer reuse
- Write or review Vitest tests for Three.js components

---

## Component Blueprint

Every Three.js Angular component follows this exact structure:

```typescript
@Component({
  selector: 'app-my-three',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:resize)': 'onResize()' },
  template: `<canvas #canvas class="...tailwind classes..."></canvas>`,
})
export class MyThreeComponent implements OnDestroy {
  // 1. ViewChild
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  // 2. Injected deps
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  // inject ThemeService if theme-reactive

  // 3. Three.js private fields (typed)
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationFrameId?: number;
  private clock = new THREE.Clock();

  constructor() {
    // 4a. Theme reactivity via effect()
    effect(() => {
      // react to signal changes and update uniforms / blending
    });

    // 4b. Browser-only init
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.initThree();
        this.animate();
      }
    });

    // 4c. Cleanup via DestroyRef
    this.destroyRef.onDestroy(() => this.cleanup());
  }

  private initThree(): void { /* setup scene, camera, renderer, objects */ }
  private animate(): void { /* RAF loop - no Angular CD */ }
  onResize(): void { /* update camera aspect + renderer size */ }
  private cleanup(): void { /* cancelAnimationFrame + dispose ALL */ }
  ngOnDestroy(): void {} // required to satisfy OnDestroy interface
}
```

---

## Initialization Checklist

- [ ] `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` — always cap
- [ ] `renderer.setSize(window.innerWidth, window.innerHeight)` — full viewport
- [ ] `alpha: true` + `antialias: true` on WebGLRenderer for portfolio aesthetics
- [ ] Camera `aspect` = `window.innerWidth / window.innerHeight`
- [ ] `camera.updateProjectionMatrix()` after any camera change

---

## Shader Authoring Rules

### Vertex Shader Checklist
- [ ] Declare all `uniform` and `attribute` inputs at top
- [ ] Declare `varying` outputs for fragment stage
- [ ] Use `modelViewMatrix`, `projectionMatrix`, `position` from THREE built-ins
- [ ] Drive animation via `uTime` uniform (from `THREE.Clock`)
- [ ] Per-vertex variation via `attribute float aOffset` on `BufferGeometry`
- [ ] Clamp `gl_PointSize`: `gl_PointSize = min(computedSize * uPixelRatio, 50.0);`

### Fragment Shader Checklist
- [ ] Receive `varying float vGlow` (or similar) from vertex
- [ ] Discard outside-circle fragments: `if (distance(gl_PointCoord, vec2(0.5)) > 0.5) discard;`
- [ ] Use `smoothstep` for soft edges and glow falloff
- [ ] Branch on `uIsDark` (float flag) for dark/light mode rendering logic
- [ ] Dark: neon glow with `AdditiveBlending`; Light: solid dots with `NormalBlending`
- [ ] Output `gl_FragColor = vec4(finalColor, alpha);`

### ShaderMaterial Uniforms (Standard Set)
```typescript
uniforms: {
  uTime:       { value: 0 },
  uColor:      { value: new THREE.Color() },
  uIsDark:     { value: 0.0 },  // 1.0 = dark, 0.0 = light
  uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
}
```

---

## Theme Reactivity Pattern

```typescript
effect(() => {
  const isDark = this.themeService.darkMode();
  if (this.mesh?.material instanceof THREE.ShaderMaterial) {
    this.mesh.material.uniforms['uColor'].value.set(isDark ? darkColor : lightColor);
    this.mesh.material.uniforms['uIsDark'].value = isDark ? 1.0 : 0.0;
    this.mesh.material.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
  }
});
```

---

## Cleanup Pattern (Mandatory)

```typescript
private cleanup(): void {
  if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  if (this.renderer) this.renderer.dispose();
  if (this.myObject) {
    this.myObject.geometry.dispose();
    (this.myObject.material as THREE.Material).dispose();
  }
  this.scene?.clear();
}
```

Missing any of these = memory leak. Task is rejected without all four steps.

---

## Resize Pattern

```typescript
onResize(): void {
  if (!this.renderer || !this.camera) return;
  this.camera.aspect = window.innerWidth / window.innerHeight;
  this.camera.updateProjectionMatrix();
  this.renderer.setSize(window.innerWidth, window.innerHeight);
  this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // update uPixelRatio uniform if using ShaderMaterial
}
```

---

## Performance Rules

| Rule | Why |
|---|---|
| Particle count ≤ 500 | Mobile GPU safety |
| Cap pixel ratio at 2 | Prevents 3x/4x overdraw on high-DPI |
| No `new THREE.*` inside RAF | Avoids per-frame GC pressure |
| `BufferGeometry` only | Never use legacy `Geometry` |
| No `scene.traverse()` in RAF | O(n) per frame — precompute references |
| `depthWrite: false` on transparent materials | Prevents z-fighting artifacts |
| `THREE.Clock` for time | Consistent delta independent of frame rate |

---

## Vitest Testing Pattern

```typescript
// Mock WebGL context
vi.stubGlobal('HTMLCanvasElement', {
  prototype: { getContext: vi.fn(() => ({
    getExtension: vi.fn(),
    getParameter: vi.fn(),
    // ... minimal WebGL mock
  })) }
});

it('should create component without errors', () => {
  const { fixture } = TestBed.configureTestingModule({ ... }).compileComponents();
  expect(fixture.componentInstance).toBeTruthy();
});

it('should call cleanup on destroy', () => {
  const spy = vi.spyOn(component as any, 'cleanup');
  fixture.destroy();
  expect(spy).toHaveBeenCalled();
});
```

---

## SSR Safety Checklist

- [ ] All Three.js init inside `afterNextRender()` + `isPlatformBrowser()` guard
- [ ] `inject(DOCUMENT)` used — never `document` global
- [ ] `window.*` only accessed inside browser guard
- [ ] No Three.js imports that reference `window` at module load time

---

## Delegation

After Three.js implementation:
1. → **Performance Monitor**: validate RAF efficiency, bundle size, Lighthouse impact
2. → **Security**: verify no eval-like patterns in shader strings, no XSS via dynamic canvas
3. → **Tester**: ensure cleanup test, resize test, theme reactivity test pass
