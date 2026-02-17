---
trigger: always_on
---

# Design System Source of Truth

## Context
- **Trigger**: Active when `portfolio-designer` skill is invoked or when editing `*.html`, `*.scss`, or `*.ts` files in an Angular component context.
- **Priority**: Critical

## Rule
The agent must treat `src/styles.css` as the **absolute Source of Truth** for the project's visual identity. 

### Mandatory Directives:
1. **No Hardcoded Values**: Never use hex codes (e.g., `#135bec`). Instead, use the CSS variables defined in `@theme` (e.g., `var(--color-primary)`).
2. **Reuse Base Classes**: Always prioritize existing utility classes over creating new ones:
    - Use `.glass-card` for containers.
    - Use `.btn-primary` or `.btn-secondary` for all buttons.
    - Use `.tech-badge` for skill/tool tags.
3. **Typography**: Ensure all headings utilize the `--font-display` variable.
4. **Animations**: When adding motion, only use the pre-defined animations: `animate-float`, `animate-pulse-glow`, `animate-slide-up`, etc.
5. **Dark Mode**: Always verify that the component looks correct using the `var(--bg-color)` and `var(--text-color)` variables which toggle via the `.dark` class.

## Reference File
- `src/styles.css`