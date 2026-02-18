# Unit Test Expert (Angular Native Vitest)

## Goal
Maintain 70% code coverage using Angular's integrated Vitest runner without requiring external configuration files.

## Description
Use this skill for all TypeScript logic. It leverages the Angular CLI's native testing capabilities to ensure stability.

## Testing Directives
1. **Execution**: Use the command `ng test --watch=false --code-coverage`.
2. **Coverage Analysis**: 
    - The agent must read the coverage report generated in the `/coverage` folder.
    - **Target**: 70% minimum line coverage for modified files.
3. **Complex Logic Focus**:
    - **Signals**: Test `computed()` and `effect()` dependencies.
    - **RxJS**: Use `fakeAsync` and `tick` for any remaining Observable logic.
    - **Control Flow**: Test all branches of the new `@if` and `@switch` syntax.

## Workflow
1. Write logic and matching `*.spec.ts`.
2. Run `ng test --code-coverage`.
3. If the terminal output or coverage report shows <70%, the agent must identify missing branches and add tests until the threshold is met.