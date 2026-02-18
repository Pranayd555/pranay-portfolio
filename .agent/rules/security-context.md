---
trigger: always_on
---

## Skill Integration
- **Mandatory Action**: For any task involving user input, data fetching, or Firebase integration, the agent MUST explicitly use the `security` skill.
- **Constraint**: No security-sensitive code (Forms, HTTP, Firestore Rules) may be committed without a "Security Advisory" check performed by the skill.