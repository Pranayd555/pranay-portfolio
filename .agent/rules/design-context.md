---
trigger: always_on
---

## Skill Integration
- **Mandatory Action**: Whenever the agent creates or modifies HTML templates, SCSS/CSS files, or UI-related TypeScript (like animations or dialogs), it MUST actively invoke the `portfolio-designer` skill.

## Rule
The agent must treat `src/styles.css` as the absolute Source of Truth...