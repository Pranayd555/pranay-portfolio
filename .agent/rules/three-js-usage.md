---
trigger: always_on
---

# Three.js Usage & Selective Activation

## Context
- **Applicability**: UI, Hero Sections, and Canvas Animations.
- **Trigger**: User keywords "3D", "Three.js", "Immersive", or "WebGL".

## Rule: Forced Skill Invocation
1. **Activation**: The agent is **PROHIBITED** from writing Three.js code in isolation. 
2. **Mandatory Action**: If a 3D task is identified, the agent **MUST** explicitly invoke the `three-js-architect` skill before generating any code.
3. **Zoneless Compliance**: The agent must confirm it is using the Angular 21 (Zoneless) approach defined in the skill, specifically avoiding `NgZone` and using `afterNextRender`.

## Implementation Constraints
- **Selective Use**: Do not use Three.js for standard UI transitions. Use CSS/Tailwind unless 3D depth or complex geometry is required.
- **Performance Gate**: Every Three.js implementation must be wrapped in an Angular `@defer` block to keep the initial bundle size minimal.
- **Resource Management**: The agent must demonstrate how it is using `DestroyRef` to clean up the Three.js scene as per the skill's instructions.

## Verification
- Before finishing, the agent must state: "3D implementation verified against `three-js-architect` skill for Angular 21/Zoneless compliance."