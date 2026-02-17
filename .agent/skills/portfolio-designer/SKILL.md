# Portfolio Designer Skill (Angular + Tailwind v4)

## Goal
Ensure all new components and UI updates strictly adhere to the established "Glass-Neon" design system defined in `styles.css`.

## Description
Use this skill when generating Angular components, HTML templates, or modifying styles to maintain visual consistency and leverage existing design tokens.

## Design Tokens (Mandatory)
When styling, use these CSS variables or Tailwind classes instead of hardcoded hex values:
- **Primary Action**: `var(--color-primary)` (#135bec)
- **Neon Accents**: `var(--color-secondary)` (Cyan), `var(--color-accent)` (Magenta)
- **Fonts**: Headings must use `font-display` ("Space Grotesk").
- **Surfaces**: Use the `.glass-card` utility for containers.
- **Borders**: Use `.glow-border` for high-impact elements.

## Styling Instructions
1. **Buttons**: 
   - Use `.btn-primary` for main CTAs (automatic gradient + hover).
   - Use `.btn-secondary` for ghost/glass actions.
2. **Interactive Elements**:
   - Apply `.tilt-card` for project showcases to enable 3D perspective.
   - Use `data-tooltip="text"` for accessible, styled tooltips.
3. **Animations**: 
   - Use `animate-float` for hero elements.
   - Use `animate-slide-up` for entrance transitions.
   - Use `animate-glitch` sparingly for "cyber" accents.
4. **Dark Mode**: Support is required. Variables like `--bg-color` and `--glass-bg` handle the transition automatically. Ensure the agent uses `dark:` variants for manual overrides.

## Verification Checklist
- [ ] Is the component using the `Space Grotesk` display font?
- [ ] Does the element respect the `backdrop-filter: blur(16px)` standard?
- [ ] Are tech tags using the `.tech-badge` class?
- [ ] Does it maintain the 300ms transition duration defined in the base layer?