---
trigger: always_on
---

# Testing & Coverage Standards

## Context
- **Applicable Files**: `src/**/*.ts`
- **Trigger**: Any modification to application logic or state.

## Skill Integration
- **Mandatory Action**: The agent MUST invoke the `unit-test-expert` skill.
- **Enforcement**: No pull request or "task complete" status is valid unless the agent provides a summary of the test results and the coverage percentage.

## Standards
- **Mocking**: Use the `provideHttpClientTesting()` and `HttpTestingController` for API mocks.
- **Component Testing**: Use `TestBed` but prioritize "shallow" testing (mocking child components) to keep Vitest execution speeds high.
- **Edge Cases**: For every complex function, the agent must include a "Failure Mode" test case (e.g., what happens if the Firebase service returns an error).

## Negative Constraints
- DO NOT ignore the `coverage/` output.
- DO NOT commit code with "failing" tests. If a test fails, fixing it is the priority over adding new features.