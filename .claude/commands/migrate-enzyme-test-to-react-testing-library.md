---
description: Migrate an Enzyme test file to React Testing Library following established patterns
---

# Migrate Enzyme Test to React Testing Library

Migrate the specified Enzyme test file to React Testing Library (RTL) following the established migration patterns and best practices documented in:
- `.claude/local/rules/tests/Enzyme-to-RTL-tests-rules.md` (migration-specific rules)
- `.claude/local/rules/tests/Console_React_Component_Testing_Best_Practices.md` (comprehensive RTL best practices)

## Phase 0: Reconnaissance & Mental Modeling (Read-Only)

1. **Read the target Enzyme test file** provided by the user
2. **Read the migration rules** from `.claude/local/rules/tests/Enzyme-to-RTL-tests-rules.md`
3. **Read the RTL best practices** from `.claude/local/rules/tests/Console_React_Component_Testing_Best_Practices.md`
4. **Read the source component** being tested to understand what users actually see
5. **Analyze the original Enzyme tests:**
   - What behavior do they verify?
   - Are they testing implementation details or user behavior?
   - What components are being mocked?
   - What assertions are being made?
6. **Identify potential challenges:**
   - Portal components (tooltips, modals, popovers)
   - Complex mock requirements
   - TypeScript type conflicts
   - Tests that heavily test implementation details

## Phase 1: Planning & Strategy

Create a migration plan that addresses:
- Which tests verify real user behavior (keep/migrate)
- Which tests verify implementation details only (remove/replace)
- Required mocks and their complexity
- Expected challenges and solutions
- List of tests to migrate with brief description of each

## Phase 2: Execution & Implementation

Migrate the tests following these principles and the comprehensive guidelines in `.claude/local/rules/tests/Console_React_Component_Testing_Best_Practices.md`:

### Test File Structure
- Ensure test file is in the same directory as the component (`.test.tsx` or `.test.jsx`)
- Group tests in `describe` blocks by component name
- Use `it()` for test definitions (not `test()`)
- Follow the "expected result when conditions" format for test descriptions
- Use single empty line between tests
- Structure tests using Arrange-Act-Assert (AAA) pattern

### Import Changes
- Replace `import { shallow, mount } from 'enzyme'` with RTL imports
- Add `import { screen } from '@testing-library/react'`
- Import `renderWithProviders` from `@console/shared/src/test-utils/unit-test-utils`
- Import any models, utilities, or components needed for assertions

### Mock Strategy
- Keep mocks **simple** - avoid `require('react')` and `React.createElement()` when possible
- Use `jest.fn(() => null)` or `jest.fn(() => 'ComponentName')` for simple mocks
- Use `jest.fn((props) => props.children)` for wrapper components
- For mocks that need to return proper React elements, use `require('react')` with ESLint disable comments:
  ```typescript
  /* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
  const { MockedComponent } = require('@path/to/module');
  /* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
  ```
- Mock components should return proper React elements, not plain strings

### Test Conversion Patterns

**Rendering:**
```typescript
// ❌ BEFORE (Enzyme)
const wrapper = shallow(<Component />);

// ✅ AFTER (RTL)
renderWithProviders(<Component />);
```

**Finding Elements:**
```typescript
// ❌ BEFORE (Enzyme)
wrapper.find(ChildComponent).exists()
wrapper.find('.class-name').exists()

// ✅ AFTER (RTL) - Semantic queries (follow priority order from best practices)
// 1. getByRole (preferred)
screen.getByRole('button', { name: /submit/i })
// 2. getByLabelText (for form elements)
screen.getByLabelText('Username')
// 3. getByPlaceholderText
screen.getByPlaceholderText('Enter your name')
// 4. getByText
screen.getByText('Expected Text')
// 5. getByDisplayValue, getByAltText, getByTitle
// 6. getByTestId (last resort - requires explanation)
```

**Checking Props:**
```typescript
// ❌ BEFORE (Enzyme)
expect(wrapper.find(Child).props().myProp).toBe('value');

// ✅ AFTER (RTL) - Mock the child and verify calls
jest.mock('./Child', () => jest.fn(() => null));
const mockChild = Child as jest.Mock;

expect(mockChild).toHaveBeenCalledTimes(1);
const [childProps] = mockChild.mock.calls[0];
expect(childProps.myProp).toEqual('value');
```

**Assertions:**
- Use `.toBeVisible()` for visual elements (default choice)
- Use `.toBeInTheDocument()` only for non-visual elements or negative assertions
- Use `toMatchObject()` instead of `toBe()` for object comparisons
- Avoid `expect.anything()` - be specific

**Accessibility Testing:**
- Add accessibility tests using `checkAccessibility(container)` from `@testUtils`
- Test each state of the component for accessibility
- Use `it.skip()` with explanation if external library causes accessibility issues
- Example:
```typescript
it('is accessible on initial render', async () => {
  const { container } = renderWithProviders(<Component />);
  await checkAccessibility(container);
});
```

**User Interactions:**
- Use the `user` helper from render: `const { user } = renderWithProviders(...)`
- Always `await` user actions: `await user.click(...)`, `await user.type(...)`
- Clear textbox before typing: `await user.clear(textbox); await user.type(textbox, 'value')`

### Critical Rules to Follow

1. **Never use meaningless assertions:**
   ```typescript
   // ❌ WRONG - Always passes
   expect(container).toBeInTheDocument();

   // ✅ CORRECT - Test actual behavior
   expect(screen.getByText('Expected Content')).toBeVisible();
   ```

2. **No JSX in jest.mock():**
   ```typescript
   // ❌ WRONG - Causes babel-plugin-jest-hoist errors
   jest.mock('@console/internal/components/utils', () => ({
     LoadingBox: () => <div>Loading...</div>,
   }));

   // ✅ CORRECT - Use require('react')
   jest.mock('@console/internal/components/utils', () => {
     const React = require('react');
     return {
       LoadingBox: () => React.createElement('div', null, 'Loading...'),
     };
   });
   ```

3. **Portal components need special handling:**
   ```typescript
   // ❌ WRONG - Tooltip uses portal, container.firstChild is null
   expect(container.firstChild).not.toBeNull();

   // ✅ CORRECT - Test for no errors
   expect(() => {
     renderWithProviders(<ComponentWithTooltip />);
   }).not.toThrow();
   ```

4. **Clean up spies properly:**
   ```typescript
   beforeEach(() => {
     jest.clearAllMocks();     // Clear call history
   });

   afterEach(() => {
     jest.restoreAllMocks();   // Remove spies
   });
   ```

## Phase 3: Verification & Autonomous Correction

1. **Run the tests:**
   ```bash
   yarn test --testPathPattern=<test-file-name> --no-coverage
   ```
2. **If tests fail:**
   - Analyze the error messages
   - Fix the issues autonomously
   - Re-run tests
   - Repeat until all tests pass
3. **Run ESLint:**
   ```bash
   yarn eslint <test-file-path> --max-warnings=0
   ```
4. **Fix any ESLint errors:**
   - Import ordering issues
   - Missing ESLint disable comments for `require()` statements
   - Prettier formatting issues
   - Run `--fix` if needed, then verify manually

## Phase 4: Coverage Audit

Compare the migrated tests with the original Enzyme tests:
- Are all original test cases accounted for?
- Were any tests removed? If so, why? (Document the reasoning)
- Are there any behaviors tested in Enzyme that aren't tested in RTL?
- For each missing test, determine if it should be added or if it was testing implementation details

## Phase 5: Final Report

Provide a comprehensive report including:

### Summary
- Original file: `<path>`
- Migrated file: `<path>`
- Test count: X Enzyme tests → Y RTL tests
- Test results: All passing ✅ / X failures ❌
- ESLint: Passing ✅ / Violations ❌

### Changes Made
- List of tests migrated
- List of tests removed (with justification)
- List of new tests added
- Mocking strategy changes
- Any notable patterns or solutions

### Key Improvements
- User behavior focus vs implementation details
- Semantic query usage
- Mock simplification
- Accessibility improvements (role-based queries)

### Migration Compliance Checklist
- [ ] ✅ Uses `renderWithProviders` for components needing context
- [ ] ✅ Prioritizes semantic queries (`getByRole`, `getByLabelText`, `getByText`)
- [ ] ✅ Uses `getByTestId` minimally (only for loading skeletons)
- [ ] ✅ Prefers `.toBeVisible()` for visual elements
- [ ] ✅ Keeps mocks simple, avoids `require('react')` when possible
- [ ] ✅ Avoids `expect.anything()` in assertions
- [ ] ✅ Focuses on user-facing behavior, not implementation details
- [ ] ✅ All tests passing
- [ ] ✅ ESLint passing with no warnings
- [ ] ❌ No meaningless assertions
- [ ] ❌ No JSX in `jest.mock()` (uses `require('react')` when needed)
- [ ] ❌ No testing of implementation details
- [ ] ❌ No overuse of `getByTestId`

### Next Steps
- Recommended follow-up actions (if any)
- Suggestions for improving test quality further

## Notes

- This migration follows patterns established in PRs #15581, #15611, and #15514
- All decisions should align with:
  - `.claude/local/rules/tests/Enzyme-to-RTL-tests-rules.md` (migration-specific patterns)
  - `.claude/local/rules/tests/Console_React_Component_Testing_Best_Practices.md` (comprehensive RTL guidelines)
- When in doubt, prioritize testing user-visible behavior over implementation details
- Quality over quantity - better to have fewer high-value tests than many low-value tests
- Follow the test structure guidelines from the best practices (Arrange-Act-Assert pattern)
- Use semantic queries in the priority order specified in the best practices
- Ensure all tests have clear, descriptive test descriptions following the "expected result when conditions" format
