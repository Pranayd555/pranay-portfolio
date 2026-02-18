# Angular Performance Architect Skill

## Goal
Optimize the Angular application for maximum Core Web Vitals (LCP, FID, CLS) by enforcing modern rendering patterns, efficient change detection, and clean architecture.

## Description
Use this skill when creating components, refactoring services, or auditing the bundle size and execution speed of the application.

## Core Optimization Directives

### 1. Modern Rendering & Loading
- **Progressive Rendering**: Always use `@defer` blocks in templates for non-critical path components (e.g., modals, heavy charts, or below-the-fold content).
- **Lazy Loading**: Ensure all feature modules or standalone routes are lazy-loaded via `loadComponent` or `loadChildren` in the router config.
- **Resource Loading**: Use `async` and `defer` attributes for external scripts. Ensure `fetchpriority="high"` is suggested for LCP images.

### 2. Angular Reactivity & Change Detection
- **Signals Over Observables**: Prefer `Signal`, `computed`, and `effect` for local component state.
- **OnPush Strategy**: All components must use `ChangeDetectionStrategy.OnPush`.
- **Pure Logic**: 
    - Use **Pure Pipes** for data transformations in templates.
    - Use **Pure Functions** for logic to ensure predictability and testability.
    - **FORBIDDEN**: Never call a function directly from the HTML template expression (e.g., `[value]="calculateValue()"`). Use a Signal or a Pipe instead.

### 3. Structural Integrity & Maintainability
- **Atomic Components**: Break down components exceeding 250 lines of code into smaller, reusable child components.
- **SOLID & OOP**: Follow Single Responsibility (one service = one task) and use Dependency Injection effectively.
- **DRY (Don't Repeat Yourself)**: If logic is used in more than two places, move it to a `Utility` class or a `Shared Service`.

### 4. Styling Standards
- **Zero Inline Styles**: All styling must reside in `styles.css` using the established design tokens or component-specific SCSS files.
- **Tailwind Efficiency**: Use `@apply` for reusable utility patterns to keep HTML clean.

## Execution Workflow (Using Angular MCP)
1. **Schema Check**: Use the `angular-cli` MCP to verify that new components follow the latest standalone schematics.
2. **Bundle Audit**: Before finalizing a feature, check for "fat" imports (e.g., importing an entire icon library instead of one icon).
3. **Refactor Suggestion**: If the user asks for a feature, the agent must first check if a similar functionality exists in the workspace to reuse it.

## Verification Checklist
- [ ] Are heavy components wrapped in `@defer`?
- [ ] Are there any function calls in the template? (If yes, refactor to Pipe/Signal).
- [ ] Is the logic following the Single Responsibility Principle?