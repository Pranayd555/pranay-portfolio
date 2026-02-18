# 3D Motion Architect (Angular 21 Zoneless)

## Goal
Create immersive 3D experiences using Three.js optimized for Angular 21's zoneless reactivity and Signal-based change detection.

## Description
Use this skill ONLY for explicit 3D/Three.js requests. Optimized for high-frequency updates without Zone.js overhead.

## Core Directives
1. **Zoneless Animation**: 
   - DO NOT use `NgZone`. Use native `requestAnimationFrame` or the `Web Workers API` for complex math.
   - Use `afterRender` or `afterNextRender` from `@angular/core` to initialize the Three.js renderer.
2. **Signal Integration**: 
   - Bind 3D object properties (rotation, position) to **Signals** if they need to be controlled via UI.
   - Use `effect()` to update the 3D scene when UI Signals change.
3. **Memory Management**: 
   - Use the `DestroyRef` service to handle cleanup.
   - Explicitly call `.dispose()` on geometries and materials within the `onDestroy` hook.
4. **Performance**: 
   - Use `OnPush` logic (standard in Zoneless) to ensure the 3D loop doesn't trigger unrelated component refreshes.
   - Use `OffscreenCanvas` if the 3D work is heavy, offloading the render loop to a Worker.

## Execution Workflow
1. **Scene Setup**: Utilize `afterNextRender` to ensure the DOM is ready for the Canvas.
2. **Loop**: Implement the animation loop using a recursive `requestAnimationFrame`.
3. **Signal Sync**: Create a bridge between Angular Signals and Three.js object properties.