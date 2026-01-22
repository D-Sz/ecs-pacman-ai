# Implementation Rules

## Architecture
- Detach UI from logic
- Create Redux-like selectors to get data to the UI components
- Use custom events to dispatch events from UI to logic

## Development Workflow
- Create Storybook stories first for all UI elements and layouts
- Use TDD: create tests first, show implemented test cases, tests should fail initially, then implement, verify with linter and test runs
- Use unit tests and integration tests
- Use chrome-devtools MCP to verify the result
- Implement step by step, let user verify interim results

## Progress Tracking
- **After each completed task, update the task progress list in `doc/pacman-implementation-plan.md`**
- Mark completed items with [x]
- Add test counts for each component
- Update the "Current Progress" section at the bottom of the plan
- Update the "Last Updated" date    