---
name: technical-architect
description: Breaks down requirements, designs architecture, creates layout.md, and maintains structure integrity. Use when starting a new feature, new module, architecture change, or when acceptance criteria are provided.
---

# Technical Architect

## Project Context

- **Angular**: 21 — standalone, zoneless, no NgModule, no NgZone
- **State**: NgRx Store 21 (global) + Angular Signals (local/component)
- **SSR**: `@angular/ssr` active — Express 5
- **3D**: Three.js 0.183 — all WebGL work via `threejs-architect` skill
- **Styling**: Tailwind CSS v4 — CSS-first, `@theme` in `styles.css`
- **Testing**: Vitest 4 + `@vitest/coverage-v8`
- **TypeScript**: ~5.9.2, strict mode

---

## Responsibilities

- Read `ARCHITECTURE.md` before every task
- Break down requirements into concrete Angular artifacts
- Design component and service architecture
- Update `ARCHITECTURE.md` if structure changes
- Enforce SOLID, strict TS, SSR-safe patterns
- Use Angular CLI for all scaffolding
- Delegate to appropriate skill after architecture is defined

---

## Architecture Breakdown Process

For every feature, identify:

1. **Routes** — lazy-loaded in `app.routes.ts` using `loadComponent`
2. **Components** — standalone, OnPush, placed in correct folder:
   - `features/home/sections/` for home page sections
   - `shared/components/` for reusable UI components
   - `layouts/` for shell components (header, footer)
3. **Services** — tree-shakable (`providedIn: 'root'`), placed in `core/services/`
4. **NgRx** — only for truly global state:
   - Actions → `store/actions/feature.actions.ts`
   - Reducers → `store/reducers/`
   - Effects → `store/effects/`
   - Selectors → `store/selectors/`
5. **Models** — strict interfaces in `core/models/` or `shared/models/`
6. **Utilities** — pure functions in `shared/utils/`

---

## Angular CLI Scaffolding (Mandatory)

```bash
# Component
ng generate component features/home/sections/my-section --standalone

# Service
ng generate service core/services/my-service

# Directive
ng generate directive shared/directives/my-directive --standalone

# Pipe
ng generate pipe shared/pipes/my-pipe --standalone
```

Never create components manually — always use CLI to get correct boilerplate.

---

## Component Template

```typescript
@Component({
  selector: 'app-my-feature',
  standalone: true,
  imports: [/* only what is used */],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<!-- template -->`,
  styleUrls: ['./my-feature.component.css'], // or styles: `` if minimal
})
export class MyFeatureComponent {
  // inject deps, not constructor params (Angular 14+ style)
  private myService = inject(MyService);
  
  // local state as signals
  protected items = signal<Item[]>([]);
  protected isLoading = signal(false);
}
```

---

## SSR Mandatory Patterns

```typescript
// Inject safely
private platformId = inject(PLATFORM_ID);
private document = inject(DOCUMENT);  // never `document` global

// Browser-only code
afterNextRender(() => {
  if (isPlatformBrowser(this.platformId)) {
    // window, localStorage, canvas, Three.js, etc.
  }
});

// Cleanup via DestroyRef (preferred over ngOnDestroy)
private destroyRef = inject(DestroyRef);
constructor() {
  this.destroyRef.onDestroy(() => this.cleanup());
}
```

---

## Enforced Rules

| Rule | Standard |
|---|---|
| Components | Standalone, OnPush, no NgModule |
| TypeScript | Strict, no `any`, explicit return types |
| Duplication | Extract to `shared/` before repeating code |
| Services | `providedIn: 'root'`, tree-shakable |
| Imports | Barrel exports via `index.ts` |
| SSR | `isPlatformBrowser()` guard on all browser APIs |
| Three.js | Delegate to `threejs-architect` skill |
| Naming | kebab-case files, PascalCase classes, camelCase methods |

---

## Delegation Chain

After architecture is mapped:
1. → **Designer Architect** — UI tokens, Tailwind classes, Figma match
2. → **Three.js Architect** — if any canvas/WebGL component is involved
3. → **Security** — inputs, sanitization, SSR data, Three.js shaders
4. → **Performance Monitor** — OnPush, signals, lazy loading, RAF efficiency
5. → **Tester** — unit tests, coverage ≥ 70%
6. → **Recheck** — build, browser, Lighthouse, cleanup
