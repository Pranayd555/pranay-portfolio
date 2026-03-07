---
name: performance-monitor
description: Optimizes rendering, enforces OnPush and signals, lazy loading, and maintains Lighthouse ≥85. Use when optimizing performance, fixing memory leaks, or before release. Covers both Angular and Three.js/WebGL performance.
---

# Performance Monitor

## Project Context

- Angular 21 — zoneless, standalone, OnPush, signals
- Three.js 0.183 — WebGL, ShaderMaterial, BufferGeometry, RAF loop
- SSR active — server render performance matters too
- Tailwind v4 — no runtime CSS-in-JS overhead

---

## Responsibilities

- Audit and optimize Angular rendering
- Audit and optimize Three.js / WebGL performance
- Enforce memory leak prevention patterns
- Evaluate bundle size impact
- Maintain Lighthouse ≥ 85 (performance category)

---

## Angular Performance Checklist

### Change Detection
- [ ] `ChangeDetectionStrategy.OnPush` on every component — no exceptions
- [ ] Local state via `signal()`, `computed()`, `effect()` — not BehaviorSubject
- [ ] No `cdr.detectChanges()` — if needed, redesign component architecture
- [ ] `NgRx` selectors memoized — use `createSelector` with proper input signals

### Subscriptions & Cleanup
- [ ] `takeUntilDestroyed(this.destroyRef)` for all Observable subscriptions
- [ ] `inject(DestroyRef).onDestroy()` for imperative cleanup
- [ ] No bare `.subscribe()` without cleanup — enforced
- [ ] `effect()` with cleanup for Three.js uniform updates

### Bundle & Loading
- [ ] All routes lazy-loaded: `loadComponent` / `loadChildren` in `app.routes.ts`
- [ ] `defer` / `async` on non-critical scripts in `index.html`
- [ ] No duplicate Three.js imports (three is ~600kb — import once)
- [ ] No lodash, moment, or heavy utility libs for small tasks

---

## Three.js / WebGL Performance Checklist

### Renderer Setup
- [ ] `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` — never uncapped
- [ ] `renderer.setSize(width, height)` matches actual viewport
- [ ] `alpha: true` only when background transparency needed
- [ ] `antialias: true` only when visual quality justifies cost (portfolio = yes)

### Geometry & Materials
- [ ] `BufferGeometry` only — never legacy `Geometry`
- [ ] `depthWrite: false` on transparent/additive materials
- [ ] Pre-allocate all geometry and materials — never `new THREE.*` inside RAF
- [ ] Uniforms are the only per-frame mutation (`uTime`, etc.)

### Animation Loop (RAF)
- [ ] No Angular CD inside RAF — pure WebGL state updates only
- [ ] `THREE.Clock.getElapsedTime()` for time — frame-rate independent
- [ ] `animationFrameId` stored as private field for cancellation
- [ ] RAF cancelled in `cleanup()` before any other disposal

### Resource Disposal (Critical)
All four steps must be present in `cleanup()`:
```typescript
cancelAnimationFrame(this.animationFrameId);  // 1. Stop loop first
this.renderer.dispose();                       // 2. Free GPU context
this.myObject.geometry.dispose();              // 3. Free GPU buffer
(this.myObject.material as THREE.Material).dispose(); // 4. Free GPU program
this.scene.clear();                            // 5. Remove references
```

### Particle Systems
- [ ] Particle count ≤ 500 for mobile GPU safety
- [ ] Use staggered `aOffset` attribute for per-particle animation variation
- [ ] Clamp `gl_PointSize` to max 50px to prevent overdraw on polar/close particles
- [ ] `depthWrite: false` on `Points` material

### Resize Handler
- [ ] Update `camera.aspect` + `camera.updateProjectionMatrix()`
- [ ] `renderer.setSize(w, h)` + `renderer.setPixelRatio(min(dpr, 2))`
- [ ] Update `uPixelRatio` uniform if ShaderMaterial uses it

---

## Bundle Size Evaluation

Before adding any new dependency:
1. Check if native ES2023+ covers the need
2. If Three.js add-on (postprocessing, loaders) — confirm it's in `three/examples/jsm/` (tree-shakable)
3. Run `ng build --stats-json` and inspect `stats.json` for chunk sizes
4. Flag if main chunk exceeds 500kb initial

---

## Lighthouse Targets

| Metric | Target |
|---|---|
| Performance | ≥ 85 |
| Accessibility | ≥ 90 |
| Best Practices | ≥ 90 |
| SEO | ≥ 90 |
| FCP | < 1.8s |
| LCP | < 2.5s |
| CLS | < 0.1 |

---

## Monitoring in Dev

- Chrome DevTools → Performance tab → record while interacting with Three.js scene
- Chrome DevTools → Memory tab → heap snapshot before/after component destroy
- Verify "WebGL context lost" is never emitted after component destroy
- Three.js FPS target: 60fps on mid-range device (MacBook, mid-range Android)

---

## Delegation

After performance audit:
→ If issues found in Three.js cleanup → escalate to **threejs-architect**
→ If bundle too large → escalate to **technical-architect** for lazy split
