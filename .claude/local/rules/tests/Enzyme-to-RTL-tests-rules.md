# Enzyme to React Testing Library Migration Rules

> **Purpose:** Operational rules and patterns for migrating Enzyme tests to React Testing Library in the OpenShift Console codebase.
>

---

## Critical Rules

### 🚨 Rule 1: Never Use Meaningless Assertions

```typescript
// ❌ WRONG: This always passes and tests nothing
it('should render MyComponent without errors', () => {
  const { container } = renderWithProviders(<MyComponent {...props} />);
  expect(container).toBeInTheDocument();
});
```

**Why it's wrong:**
- `container` is the root `<div>` that RTL always creates
- This assertion **always passes**, even if your component returns `null` or crashes
- Provides zero information about component behavior

**What to do instead:**

```typescript
// ✅ OPTION 1: Remove the test if other tests verify rendering
// If you have tests like this, the render test is redundant:
it('should render MultiListPage', () => {
  renderWithProviders(<MyComponent {...props} />);
  expect(mockMultiListPage).toHaveBeenCalledTimes(1);
});

// ✅ OPTION 2: Smoke test (no assertion needed)
it('should render without errors', () => {
  renderWithProviders(<MyComponent {...props} />);
  // If render() completes, test passes
});

// ✅ OPTION 3: Test actual behavior
it('should render MyComponent', () => {
  renderWithProviders(<MyComponent {...props} />);
  expect(mockChildComponent).toHaveBeenCalled();
});
```

**Key Principle:** Test behavior, not implementation. Focus on value, not coverage percentage.

---

### 🚨 Rule 2: Jest Mocks Cannot Use JSX Syntax

```typescript
// ❌ WRONG: JSX in jest.mock() causes babel-plugin-jest-hoist errors
jest.mock('@console/internal/components/factory', () => ({
  TableData: ({ children, className }) => (
    <td className={className}>{children}</td>
  ),
}));

// Error: "The module factory of jest.mock() is not allowed to
// reference any out-of-scope variables. Invalid variable access: jsx_runtime_1"
```

**Why it fails:**
- `jest.mock()` is hoisted to the top of the file before imports
- JSX transformation requires React in scope
- React doesn't exist yet during hoisting

**Solutions:**

```typescript
// ✅ SOLUTION 1: Simple mock (preferred for most cases)
jest.mock('@console/internal/components/factory', () => ({
  TableData: ({ children }) => children,
}));

// ✅ SOLUTION 2: Use require('react') if DOM structure needed
jest.mock('@console/internal/components/factory', () => {
  const React = require('react');
  return {
    TableData: ({ children, className }) =>
      React.createElement('td', { className }, children),
  };
});

// ✅ SOLUTION 3: Mock as jest.fn for call verification
jest.mock('@console/internal/components/factory', () => ({
  TableData: jest.fn((props) => props.children),
}));
```

---

### ⚠️ Rule 3: Pragmatism Over Dogma - When `container.textContent` is Acceptable

React Testing Library discourages `container` queries, but there are valid exceptions.

```typescript
// Mock that flattens DOM structure
jest.mock('@console/internal/components/factory', () => ({
  TableData: ({ children }) => children, // Returns children only, no <td>
}));

it('should render all vulnerability data', () => {
  const { container } = renderWithProviders(<ImageVulnerabilityRow {...props} />);

  // ⚠️ ACCEPTABLE: Document WHY you're using this pattern
  // Note: TableData mock returns children only, flattening the table structure.
  // This causes text nodes to have irregular whitespace, making exact text matching unreliable.
  // Using container.textContent to verify all expected data is rendered.
  expect(container.textContent).toContain('Critical');
  expect(container.textContent).toContain('libcurl');
  expect(container.textContent).toContain('Red Hat');
});
```

**When is this acceptable?**
- ✅ Mock constraints prevent proper DOM structure
- ✅ Alternative would require complex React.createElement mocks
- ✅ Comment clearly explains the trade-off
- ✅ Tests still verify the right data appears

**When is this NOT acceptable?**
- ❌ You didn't try semantic queries first
- ❌ No comment explaining why
- ❌ Could easily fix the mock instead

---

### 🚨 Rule 4: Testing Portal-Based Components (Tooltips, Popovers, Modals)

Components that render using React portals (tooltips, popovers, modals) don't add children to the container DOM, requiring different testing approaches.

```typescript
// ❌ WRONG: Testing for container children fails with portal components
it('should render CopyClipboard if element is found', () => {
  const { container } = renderWithProviders(<MarkdownCopyClipboard {...props} />);
  
  expect(container.firstChild).not.toBeNull();  // ❌ Fails - Tooltip uses portal!
});
```

**Why it fails:**
- Portal components render outside the container (often to document.body)
- `container.firstChild` is `null` even when component renders successfully
- Creates false negative - test fails when component works correctly

**Solutions:**

```typescript
// ✅ SOLUTION 1: Test for no errors (portal components)
it('should render CopyClipboard if element is found', () => {
  // Component renders Tooltip which uses portals
  expect(() => {
    renderWithProviders(<MarkdownCopyClipboard {...props} />);
  }).not.toThrow();
});

// ✅ SOLUTION 2: Test for null when component should return nothing
it('should render null if no element is found', () => {
  const { container } = renderWithProviders(<MarkdownCopyClipboard {...props} />);
  
  expect(container.firstChild).toBeNull();  // ✅ Valid for negative assertions
});

// ✅ SOLUTION 3: Query portal content directly (when needed)
it('should show tooltip on hover', async () => {
  const { user } = renderWithProviders(<MyComponent />);
  
  await user.hover(screen.getByRole('button'));
  
  // Tooltip renders to document.body via portal
  expect(screen.getByRole('tooltip')).toBeInTheDocument();
});
```

**When to use each approach:**

| Scenario | Assertion | Valid? |
|----------|-----------|--------|
| Component returns null | `expect(container.firstChild).toBeNull()` | ✅ Valid |
| Portal component renders | `expect(container.firstChild).not.toBeNull()` | ❌ Won't work |
| Portal component renders | `expect(() => render()).not.toThrow()` | ✅ Valid |
| Testing portal content | Query `screen` or `document.body` after trigger | ✅ Valid |

**Key Principle:** Use `container.firstChild` for testing **absence** (null), not **presence** (not null) with portal components.

---

### 🚨 Rule 5: Mock Spy Cleanup - restoreAllMocks vs clearAllMocks

When using `jest.spyOn()`, proper cleanup requires **both** `clearAllMocks()` and `restoreAllMocks()`.

```typescript
// ❌ WRONG: Only clearing mock history
beforeEach(() => {
  jest.clearAllMocks();  // Clears history but spy remains!
});

it('test 1', () => {
  jest.spyOn(document, 'querySelector').mockReturnValue(null);
  // ...
});

it('test 2', () => {
  // Error: Cannot spy on a property that is already spied on!
  jest.spyOn(document, 'querySelector').mockReturnValue(element);
});
```

**The Problem:**
- `clearAllMocks()` clears call history ONLY
- **Does NOT remove the spy**
- Spy persists across tests causing pollution

**The Solution:**

```typescript
// ✅ CORRECT: Both cleanup methods
beforeEach(() => {
  jest.clearAllMocks();     // Clear call history
});

afterEach(() => {
  jest.restoreAllMocks();   // Remove spies, restore originals
});

it('test 1', () => {
  jest.spyOn(document, 'querySelector').mockReturnValue(null);
  // ...
});

it('test 2', () => {
  // ✅ Works! Spy was removed, can create new one
  jest.spyOn(document, 'querySelector').mockReturnValue(element);
});
```

**Understanding the Difference:**

| Method | What It Does | What It Doesn't Do |
|--------|--------------|-------------------|
| `clearAllMocks()` | ✅ Clears `mock.calls` history<br>✅ Clears `mock.results`<br>✅ Clears `mock.instances` | ❌ Does NOT remove spies<br>❌ Does NOT restore original implementation |
| `restoreAllMocks()` | ✅ Removes all spies<br>✅ Restores original implementations | ❌ Does NOT clear call history |

**Best Practice Pattern:**

```typescript
describe('MyComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();     // Start each test with clean history
  });

  afterEach(() => {
    jest.restoreAllMocks();   // End each test with originals restored
  });

  it('test with spy', () => {
    const spy = jest.spyOn(document, 'querySelector').mockReturnValue(null);
    // Test runs with spy active
  });
  // afterEach removes spy, restores document.querySelector
});
```

**Key Principle:** When using `jest.spyOn()`, always use `restoreAllMocks()` in `afterEach` to prevent test pollution.

---

### 🚨 Rule 6: Testing Context Providers

When testing React Context providers, create a test component that consumes the context to verify provider behavior.

```typescript
// ✅ CORRECT: Testing Context Providers
describe('ToastProvider', () => {
  let toastContext: ToastContextType;

  const TestComponent = () => {
    toastContext = React.useContext(ToastContext);
    return null;
  };

  it('should provide a context', () => {
    renderWithProviders(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    expect(typeof toastContext.addToast).toBe('function');
    expect(typeof toastContext.removeToast).toBe('function');
  });

  it('should add and remove items from context', async () => {
    renderWithProviders(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    act(() => {
      toastContext.addToast({
        id: 'test-id',
        title: 'test title',
        variant: ToastVariant.success,
      });
    });

    await waitFor(() => {
      expect(screen.getByText('test title')).toBeVisible();
    });
  });
});
```

**Why this works:**
- Test component accesses context value directly
- Allows testing context methods without implementation details
- Enables verification of context state changes
- Simulates how real components consume the context

**Pattern from:** PR #15581 - `ToastProvider.spec.tsx`

---

### 🚨 Rule 7: Using container.firstChild - When and How

`container.firstChild` should ONLY be used to verify a component returns `null` (negative assertion). Never use it to verify component presence.

```typescript
// ✅ CORRECT: Testing for null return
it('should render null when element is not found', () => {
  jest.spyOn(document, 'querySelector').mockReturnValue(null);
  const { container } = renderWithProviders(<Spotlight {...props} />);

  expect(container.firstChild).toBeNull();  // ✅ Valid - testing absence
});

// ✅ CORRECT: Testing portal components that return React elements
it('should render CopyClipboard if element is found', () => {
  expect(() => {
    renderWithProviders(<MarkdownCopyClipboard {...props} />);
  }).not.toThrow();  // ✅ Correct for portal components
});

// ❌ WRONG: Using container.firstChild for presence
it('should render component', () => {
  const { container } = renderWithProviders(<MyComponent />);

  expect(container.firstChild).not.toBeNull();  // ❌ Meaningless assertion
  expect(container.firstChild).toBeInTheDocument();  // ❌ Always passes
});
```

**When to use `container.firstChild`:**

| Scenario | Assertion | Valid? | Reason |
|----------|-----------|--------|--------|
| Component returns null | `expect(container.firstChild).toBeNull()` | ✅ Valid | Actually tests component returns null |
| Component renders content | `expect(container.firstChild).not.toBeNull()` | ❌ Invalid | Meaningless - container always exists |
| Portal component renders | `expect(container.firstChild).not.toBeNull()` | ❌ Invalid | Portal renders outside container |
| Portal component renders | `expect(() => render()).not.toThrow()` | ✅ Valid | Tests component renders without errors |

**Key Principle:** `container.firstChild` is ONLY useful for verifying `null` returns, not for verifying presence.

**Pattern from:** PR #15581 - `Spotlight.spec.tsx` and `MarkdownCopyClipboard.spec.tsx`

---

### 🚨 Rule 8: Testing Conditional Rendering - Positive and Negative Assertions

When testing conditional rendering, always write BOTH positive (component renders) AND negative (component doesn't render) test cases.

```typescript
// ✅ CORRECT: Testing both conditions
describe('CustomResourceList', () => {
  it('should render FilterToolbar when both rowFilters and textFilter are present', () => {
    renderWithProviders(<CustomResourceList {...propsWithFilters} />);

    expect(screen.getByText('Filter Toolbar')).toBeVisible();
    expect(screen.getByText('Table')).toBeVisible();
  });

  it('should not render FilterToolbar when neither rowFilters nor textFilter is present', () => {
    renderWithProviders(
      <CustomResourceList
        {...props}
        textFilter={undefined}
        rowFilters={undefined}
      />,
    );

    expect(screen.queryByText('Filter Toolbar')).not.toBeInTheDocument();
    expect(screen.getByText('Table')).toBeVisible();  // But other content renders
  });

  it('should render LoadingBox instead of Table while loading', () => {
    renderWithProviders(<CustomResourceList {...props} loaded={false} />);

    // Positive assertion - what SHOULD render
    expect(screen.getByText('Loading...')).toBeVisible();

    // Negative assertions - what should NOT render
    expect(screen.queryByText('Table')).not.toBeInTheDocument();
    expect(screen.queryByText('Filter Toolbar')).not.toBeInTheDocument();
  });
});
```

**Best Practices:**
- ✅ Test BOTH when component appears AND when it doesn't
- ✅ Use `queryBy*` for negative assertions (`.not.toBeInTheDocument()`)
- ✅ Use `getBy*` for positive assertions (`.toBeVisible()`)
- ✅ Verify what SHOULD render alongside what shouldn't (like Table still renders when FilterToolbar doesn't)

**Why this matters:**
- Catches bugs where conditions are reversed
- Ensures component logic is correct in all states
- Prevents regressions when refactoring

**Pattern from:** PR #15581 - `CustomResourceList.spec.tsx`

---

### 🚨 Rule 9: DRY Test Setup with beforeEach

For components with complex props, use `beforeEach` to set up default props, then override specific props in individual tests.

```typescript
// ✅ CORRECT: DRY props setup
describe('CustomResourceList', () => {
  let customResourceListProps: React.ComponentProps<typeof CustomResourceList>;

  const resources = [
    { name: 'item1', status: 'successful' },
    { name: 'item2', status: 'failed' },
  ];

  beforeEach(() => {
    customResourceListProps = {
      queryArg: '',
      resources,
      textFilter: 'name',
      rowFilters: mockRowFilters,
      sortBy: 'version',
      sortOrder: SortByDirection.desc,
      ResourceRow: MockTableRow,
      resourceHeader: MockTableHeader,
    };
  });

  it('should render with default props', () => {
    renderWithProviders(<CustomResourceList {...customResourceListProps} />);
    // Test default behavior
  });

  it('should render without filters', () => {
    // Override only what changes
    renderWithProviders(
      <CustomResourceList
        {...customResourceListProps}
        textFilter={undefined}
        rowFilters={undefined}
      />
    );
  });

  it('should handle empty resources', () => {
    renderWithProviders(
      <CustomResourceList {...customResourceListProps} resources={[]} />
    );
  });
});
```

**Benefits:**
- ✅ Reduces duplication across tests
- ✅ Makes tests more maintainable (change props in one place)
- ✅ Makes it clear what's different in each test (only overridden props)
- ✅ Ensures all required props are always provided

**Important Notes:**
- Use `let` declaration for props variable so it can be reassigned in `beforeEach`
- Use TypeScript's `React.ComponentProps<typeof Component>` for type safety
- Only override props that differ from defaults in individual tests
- Keep prop setup in `beforeEach`, render in individual tests

**Pattern from:** PR #15581 - `CustomResourceList.spec.tsx`

---

### 🚨 Rule 10: Mocking Formik Hooks

When testing components that use Formik hooks (`useFormikContext`, `useField`), mock the hooks rather than wrapping in a full Formik provider.

```typescript
// ✅ CORRECT: Mock Formik hooks
import { useFormikContext, useField } from 'formik';

jest.mock('formik', () => ({
  useFormikContext: jest.fn(() => ({})),
  useField: jest.fn(() => [{}, {}]),
}));

const useFormikContextMock = useFormikContext as jest.Mock;
const useFieldMock = useField as jest.Mock;

describe('SelectorInputField', () => {
  beforeEach(() => {
    useFormikContextMock.mockClear();
    useFieldMock.mockClear();
  });

  it('should render and use formik hooks', () => {
    renderWithProviders(
      <SelectorInputField
        name="field-name"
        label="a label"
        placeholder="a placeholder"
      />,
    );

    // Verify hooks were called
    expect(useFormikContextMock).toHaveBeenCalled();
    expect(useFieldMock).toHaveBeenCalled();

    // Test rendered output
    expect(screen.getByText('a label')).toBeVisible();
  });

  it('should pass correct name to useField', () => {
    renderWithProviders(
      <SelectorInputField name="my-field" label="Label" />
    );

    expect(useFieldMock).toHaveBeenCalledWith('my-field');
  });
});
```

**Why mock instead of wrapping in Formik?**
- ✅ Faster tests (no full Formik setup needed)
- ✅ Simpler - focus on component behavior, not Formik integration
- ✅ Easier to verify hook calls and arguments
- ✅ Reduces test complexity

**When to use full Formik wrapper:**
- When testing actual form submission
- When testing complex Formik validation logic
- When testing Formik context interactions across multiple components

**Pattern from:** PR #15581 - `SelectorInputField.spec.tsx`

---

## Migration Patterns

### Pattern 1: Enzyme Shallow → RTL Render with Mocks

```typescript
// ❌ BEFORE (Enzyme)
import { shallow } from 'enzyme';
import { MultiListPage } from '@console/internal/components/factory';

const wrapper = shallow(<ImageVulnerabilitiesList {...props} />);

it('should render MultiListPage', () => {
  expect(wrapper.find(MultiListPage).exists()).toBe(true);
});
```

```typescript
// ✅ AFTER (RTL)
import { renderWithProviders } from '@console/shared/src/test-utils/unit-test-utils';
import { MultiListPage } from '@console/internal/components/factory';

jest.mock('@console/internal/components/factory', () => ({
  MultiListPage: jest.fn(() => null),
}));

const mockMultiListPage = MultiListPage as jest.Mock;

it('should render MultiListPage', () => {
  renderWithProviders(<ImageVulnerabilitiesList {...props} />);
  expect(mockMultiListPage).toHaveBeenCalledTimes(1);
});
```

**Key differences:**
- Enzyme: Test component tree structure (`wrapper.find()`)
- RTL: Mock child components, verify they're called with correct props

---

### Pattern 2: Accessing Props Passed to Mocked Components

```typescript
// ❌ FRAGILE: Direct array access
it('should pass correct props', () => {
  renderWithProviders(<MyComponent {...props} />);
  const multiListPageProps = mockMultiListPage.mock.calls[0][0];
  expect(multiListPageProps.rowFilters[0].filterGroupName).toBe('Type');
});
```

**Problems:**
- If mock wasn't called, `mock.calls[0]` is undefined → cryptic error
- No verification that mock was actually called
- Using `toBe()` on specific properties is brittle and gives poor error messages

```typescript
// ✅ ROBUST: Verify call, then destructure
it('should pass correct props', () => {
  renderWithProviders(<MyComponent {...props} />);

  expect(mockMultiListPage).toHaveBeenCalledTimes(1);
  const [multiListPageProps] = mockMultiListPage.mock.calls[0];

  expect(multiListPageProps.rowFilters).toHaveLength(2);
  expect(multiListPageProps.rowFilters[0]).toMatchObject({
    filterGroupName: 'Type',
  });
  expect(multiListPageProps.rowFilters[1]).toMatchObject({
    filterGroupName: 'Severity',
  });
});
```

**Benefits:**
- **Explicit call count verification** - Clear error if mock wasn't called
- **Better error messages** - See entire object in failure output, not just one property
- **Array destructuring** - More idiomatic than double array access
- **`toMatchObject` resilience** - Test passes even if object has extra properties
- **Future-proof** - New properties added to the object won't break existing tests

**Detailed Comparison:**

| Aspect | `mock.calls[0][0]` | `[props] = mock.calls[0]` |
|--------|-------------------|---------------------------|
| Error message | "Cannot read property '0' of undefined" | "Expected: 1, Received: 0" |
| Readability | Hard to parse | Clear intent |
| Safety | Crashes on null | Checked before access |

| Aspect | `.toBe()` | `.toMatchObject()` |
|--------|-----------|-------------------|
| Exact match | Required | Partial match OK |
| Error details | One property | Entire object |
| Extra properties | Fails | Ignored |
| Maintainability | Brittle | Flexible |

---

### Pattern 3: Finding Elements

```typescript
// ❌ ENZYME
wrapper.find('button').at(0).simulate('click');
wrapper.find(MyComponent).prop('onClick')();

// ✅ RTL
import { screen } from '@testing-library/react';

// Prefer role-based queries
screen.getByRole('button', { name: /submit/i });

// Text content
screen.getByText('Critical');

// Labels
screen.getByLabelText('Username');

// Placeholders
screen.getByPlaceholderText('Enter email');
```

**Query Priority (RTL best practice):**
1. `getByRole` - Accessible to screen readers
2. `getByLabelText` - Form elements
3. `getByPlaceholderText` - Form inputs
4. `getByText` - Non-interactive content
5. `getByTestId` - Last resort

---

### Pattern 4: Enzyme wrapper.find() → RTL Mock Verification

```typescript
// ❌ BEFORE (Enzyme)
import { shallow } from 'enzyme';

const wrapper = shallow(<MyComponent />);

it('should render child components', () => {
  expect(wrapper.find(ChildComponent).exists()).toBe(true);
  expect(wrapper.find(AnotherChild).exists()).toBe(true);
});
```

```typescript
// ✅ AFTER (RTL with mocks)
jest.mock('./ChildComponent', () => ({
  default: jest.fn(() => null),
}));

jest.mock('./AnotherChild', () => ({
  default: jest.fn(() => null),
}));

const mockChildComponent = ChildComponent as jest.Mock;
const mockAnotherChild = AnotherChild as jest.Mock;

it('should render child components', () => {
  renderWithProviders(<MyComponent />);

  expect(mockChildComponent).toHaveBeenCalledTimes(1);
  expect(mockAnotherChild).toHaveBeenCalledTimes(1);
});
```

**Key differences:**
- Enzyme: Test component tree structure via `wrapper.find()`
- RTL: Mock children, verify they're called with correct props

**Pattern from:** PR #15581 - Multiple test files

---

## Code Review Anti-Patterns

### ❌ Anti-Pattern: Restoring Tests Without Analysis

When reviewing Enzyme → RTL migrations, **don't** mechanically restore every removed test.

**Bad review comment:**
> "The old Enzyme test had a 'should render' test. Please add it back."

**Good review process:**
1. **Ask:** What unique value did the removed test provide?
2. **Check:** Do other tests already verify the same behavior?
3. **Evaluate:** Does it test behavior or implementation details?

**Example:**

```typescript
// These two tests are REDUNDANT:

it('should render without errors', () => {
  const { container } = renderWithProviders(<MyComponent />);
  expect(container).toBeInTheDocument(); // Meaningless
});

it('should render MultiListPage', () => {
  renderWithProviders(<MyComponent />);
  expect(mockMultiListPage).toHaveBeenCalled(); // Tests behavior
});

// ✅ SOLUTION: Remove the first test, keep the second
```

---

## Test Quality Over Test Count

### Principle: Test Value Hierarchy

**High-Value Test:**
- ✅ Catches real bugs
- ✅ Verifies user-facing behavior
- ✅ Would fail if component breaks

**Low-Value Test:**
- ⚠️ Tests implementation details
- ⚠️ Passes even when component is broken
- ⚠️ High maintenance burden

**No-Value Test:**
- ❌ Always passes regardless of component state
- ❌ Example: `expect(container).toBeInTheDocument()`

### Before Adding a Test, Ask:

1. **What bug does this prevent?**
   - If you can't answer, it's probably low-value

2. **Is this behavior already tested?**
   - Check existing tests for redundancy

3. **Does this test implementation or behavior?**
   - Behavior: "User clicks button → modal opens"
   - Implementation: "Component renders a <div>"

---

## Common Enzyme → RTL Transformations

### Rendering

```typescript
// Enzyme
const wrapper = shallow(<Component />);
const wrapper = mount(<Component />);

// RTL
import { render } from '@testing-library/react';
render(<Component />);

// Or with providers (Redux, Router, etc.)
import { renderWithProviders } from '@console/shared/src/test-utils/unit-test-utils';
renderWithProviders(<Component />);
```

### Checking Existence

```typescript
// Enzyme
expect(wrapper.find(Child).exists()).toBe(true);
expect(wrapper.find('.my-class').exists()).toBe(false);

// RTL
expect(screen.getByRole('button')).toBeInTheDocument();
expect(screen.queryByRole('button')).not.toBeInTheDocument();

// Or mock the child component
jest.mock('./Child', () => jest.fn(() => null));
expect(mockChild).toHaveBeenCalled();
```

### Checking Props

```typescript
// Enzyme
expect(wrapper.find(Child).props().myProp).toBe('value');

// RTL (with mocked component)
const mockChild = Child as jest.Mock;
const [childProps] = mockChild.mock.calls[0];
expect(childProps.myProp).toBe('value');
```

### Simulating Events

```typescript
// Enzyme
wrapper.find('button').simulate('click');

// RTL
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Option 1: fireEvent (synchronous)
import { fireEvent } from '@testing-library/react';
fireEvent.click(screen.getByRole('button'));

// Option 2: userEvent (better - simulates real user interaction)
// CURRENTLY we are blocked from using userEvent because our version of RTL doesn't support it. When we upgrade in the future, we can revisit using it.
// await userEvent.click(screen.getByRole('button'));
```

---

## Checklist: Reviewing Enzyme → RTL Migrations

- [ ] No meaningless assertions (`expect(container).toBeInTheDocument()`)
- [ ] No JSX in `jest.mock()` factory functions
- [ ] Portal components tested with `expect(() => render()).not.toThrow()` or query portal content
- [ ] `container.firstChild` used only for negative assertions (testing for null)
- [ ] Tests using `jest.spyOn()` have `restoreAllMocks()` in `afterEach`
- [ ] Both `clearAllMocks()` and `restoreAllMocks()` used when needed
- [ ] Mock components return proper React elements (not plain strings or null)
- [ ] Mocked components verified with call count checks before prop inspection
- [ ] `container.textContent` usage is documented with clear rationale
- [ ] Removed tests were analyzed for redundancy (not mechanically restored)
- [ ] Semantic queries (`getByRole`, `getByLabelText`) preferred over `getByTestId`
- [ ] Tests verify behavior, not implementation details
- [ ] Each test has clear value (what bug does it prevent?)
- [ ] Context providers tested using test component pattern (Rule 6)
- [ ] Conditional rendering has both positive AND negative test cases (Rule 8)
- [ ] Complex props use `beforeEach` for DRY setup with clear overrides (Rule 9)
- [ ] Formik hooks mocked rather than using full provider when appropriate (Rule 10)
- [ ] Child components mocked and verified with call counts, not existence checks

---

## Reference Examples

See these PRs for migration patterns:
- **PR #15581** - console-shared package migration with CodeRabbit review (portal components, spy cleanup, mock improvements)
- **PR #15611** - container-security package migration (reviewed in this session)
- **CONSOLE-4605** - operator-lifecycle-manager migration (in progress)

---

## Real-World Case Study: PR #15611 Improvements

### Background
PR #15611 migrated container-security tests from Enzyme to RTL. During code review, several improvements were identified and applied.

### Issue 1: Meaningless Container Assertion

**Original Code:**
```typescript
it('should render ImageVulnerabilitiesList without errors', () => {
  const { container } = renderWithProviders(<ImageVulnerabilitiesList {...props} />);
  expect(container).toBeInTheDocument();
});
```

**Problem:**
- This test **always passes** because `container` is RTL's root div
- Provides zero verification of component behavior
- Was redundant with the next test that verified MultiListPage rendering

**Resolution:**
- ✅ Removed the test entirely
- Existing test already verified component renders correctly by checking mock was called

**Lesson:** Don't mechanically restore removed tests. Analyze their value first.

---

### Issue 2: Unsafe Mock Prop Access

**Original Code:**
```typescript
it('should pass Type and Severity row filters to MultiListPage', () => {
  renderWithProviders(<ImageVulnerabilitiesList {...props} />);

  const multiListPageProps = mockMultiListPage.mock.calls[0][0];
  expect(multiListPageProps.rowFilters[0].filterGroupName).toBe('Type');
  expect(multiListPageProps.rowFilters[1].filterGroupName).toBe('Severity');
});
```

**Problems:**
1. No verification that mock was actually called
2. `mock.calls[0][0]` fails with cryptic error if mock wasn't called
3. `toBe()` checks single property, gives poor error messages
4. Will break if new properties added to filter objects

**Improved Code:**
```typescript
it('should pass Type and Severity row filters to MultiListPage', () => {
  renderWithProviders(<ImageVulnerabilitiesList {...props} />);

  expect(mockMultiListPage).toHaveBeenCalledTimes(1);  // ← Added
  const [multiListPageProps] = mockMultiListPage.mock.calls[0];  // ← Changed

  expect(multiListPageProps.rowFilters).toHaveLength(2);
  expect(multiListPageProps.rowFilters[0]).toMatchObject({  // ← Changed
    filterGroupName: 'Type',
  });
  expect(multiListPageProps.rowFilters[1]).toMatchObject({  // ← Changed
    filterGroupName: 'Severity',
  });
});
```

**What Changed:**
1. ✅ Added explicit call count verification
2. ✅ Used array destructuring instead of double bracket access
3. ✅ Changed from `toBe()` to `toMatchObject()`

**Benefits:**
- **Clear failures:** "Expected: 1 call, Received: 0" instead of "Cannot read property '0'"
- **Better context:** Error shows entire object, not just one property
- **Future-proof:** Test survives if someone adds `default: true` to filter objects
- **More idiomatic:** Destructuring is cleaner than `[0][0]`

**Lesson:** Always verify mocks were called before accessing their arguments.

---

### Issue 3: JSX in Jest Mock (Attempted Fix)

**Attempted Code (Failed):**
```typescript
jest.mock('@console/internal/components/factory', () => ({
  TableData: ({ children, className }) => (
    <td className={className}>{children}</td>  // ← JSX not allowed!
  ),
}));
```

**Error:**
```
babel-plugin-jest-hoist: The module factory of jest.mock() is not
allowed to reference any out-of-scope variables.
Invalid variable access: jsx_runtime_1
```

**Why it Failed:**
- `jest.mock()` is hoisted before imports
- JSX transformation requires React, which doesn't exist yet
- Babel plugin prevents out-of-scope variable access

**Correct Solution:**
```typescript
// Keep it simple - mock returns children only
jest.mock('@console/internal/components/factory', () => ({
  TableData: ({ children }) => children,
}));

// Then use container.textContent with clear documentation
it('should render all data', () => {
  const { container } = renderWithProviders(<ImageVulnerabilityRow {...props} />);

  // Note: TableData mock flattens structure, making semantic queries unreliable
  expect(container.textContent).toContain('Critical');
});
```

**Lesson:** Don't fight Jest's constraints. Document pragmatic solutions clearly.

---


## Meta-Lessons

### Lesson 1: Constraints Drive Solutions
Jest's hoisting mechanism prevents JSX in mocks. The "best" solution isn't always feasible. Document trade-offs clearly.

### Lesson 2: Best Practices are Guidelines, Not Laws
React Testing Library best practices (semantic queries, no `container`) are excellent defaults. But when technical constraints interfere, pragmatic solutions with clear documentation are acceptable.

### Lesson 3: Test Value > Test Coverage
100% test coverage with meaningless assertions is worse than 80% coverage with high-value tests. Every test should prevent a real bug.

---

## Real-World Case Study: PR #15581 CodeRabbit Review

### Background
PR #15581 migrated console-shared package tests from Enzyme to RTL. CodeRabbit CLI identified 4 issues that revealed important testing anti-patterns and the value of automated code review.

### Issue 1: Portal Components - False Negative Assertions

**Files Affected:**
- `MarkdownExecuteSnippet.spec.tsx` (lines 26-33)
- `MarkdownCopyClipboard.spec.tsx` (lines 18-24)

**Original Code:**
```typescript
it('should render CopyClipboard if element is found', () => {
  const { container } = renderWithProviders(<MarkdownCopyClipboard {...props} />);
  expect(container).toBeInTheDocument();  // ❌ Always passes
});
```

**CodeRabbit Finding:**
> "The assertion `expect(container).toBeInTheDocument()` always passes since the container is always in the document. This doesn't verify that CopyClipboard was actually rendered."

**Investigation Revealed:**
- Component renders `<Tooltip>` which uses React portals
- Portals render outside the container (to document.body)
- `container.firstChild` was actually `null` (component working correctly)
- Original assertion created **false positive** - test passed but verified nothing

**Fix Applied:**
```typescript
it('should render CopyClipboard if element is found', () => {
  // Component renders Tooltip which uses portals - document why
  expect(() => {
    renderWithProviders(<MarkdownCopyClipboard {...props} />);
  }).not.toThrow();
});
```

**Lesson:** Portal-based components need special testing patterns. Always verify what your assertions actually test.

---

### Issue 2: Spy Pollution - Missing Mock Restoration

**Original Code:**
```typescript
beforeEach(() => {
  jest.clearAllMocks();  // Only clears history!
});

it('test 1', () => {
  jest.spyOn(document, 'querySelector').mockReturnValue(null);
  // ...
});

it('test 2', () => {
  jest.spyOn(document, 'querySelector').mockReturnValue(element);  // Would fail!
  // ...
});
```

**CodeRabbit Finding:**
> "All tests that use `jest.spyOn(document, 'querySelector')` create spies that are never restored, which could cause test pollution."

**Problem:**
- `clearAllMocks()` clears call history but leaves spy in place
- Spy persists across tests
- Subsequent attempts to spy on same method fail
- Tests pollute each other's state

**Fix Applied:**
```typescript
beforeEach(() => {
  jest.clearAllMocks();     // Clear history
});

afterEach(() => {
  jest.restoreAllMocks();   // Remove spies ← ADDED
});
```

**Lesson:** `clearAllMocks()` ≠ `restoreAllMocks()`. Both serve different purposes and both are needed.

---

### Issue 3: Null Mock Returns - False Positive Assertions

**File Affected:** `CustomResourceList.spec.tsx` (lines 10-11, 158)

**Original Code:**
```typescript
jest.mock('@console/internal/components/factory/table', () => ({
  Table: () => null,  // ❌ Returns nothing
}));

it('should render the LoadingBox while loading', () => {
  renderWithProviders(<CustomResourceList loaded={false} />);
  
  // Test claims to verify Table isn't rendered during loading
  expect(screen.queryByText('Table')).not.toBeInTheDocument();  // ❌ Always passes!
});
```

**CodeRabbit Finding:**
> "The Table mock returns null, making assertions ineffective. Test checks for `screen.queryByText('Table')` but the mock doesn't render text."

**Problem:**
- Mock returns `null`, so "Table" text never exists
- Assertion **always passes** even if Table component IS being rendered
- Test creates false confidence - claims to verify behavior but verifies nothing
- **False positive** - test passes when it should catch bugs

**Fix Applied:**
```typescript
jest.mock('@console/internal/components/factory/table', () => {
  const React = require('react');
  return {
    Table: () => React.createElement('div', null, 'Table'),  // ✅ Renders text
  };
});

// Now assertion is meaningful
expect(screen.queryByText('Table')).not.toBeInTheDocument();  // ✅ Actually tests something
```

**Lesson:** Mocks should return testable output. Null returns create meaningless assertions.

---

### Issue 4: Plain String Mocks - Unreliable Queries

**File Affected:** `CustomResourceList.spec.tsx` (lines 18-24)

**Original Code:**
```typescript
jest.mock('@console/internal/components/filter-toolbar', () => ({
  FilterToolbar: () => 'FilterToolbar',  // ❌ Plain string
}));

it('should render FilterToolbar', () => {
  renderWithProviders(<CustomResourceList {...props} />);
  expect(screen.getByText('FilterToolbar')).toBeVisible();  // ❌ FAILS!
});
```

**Error Message:**
```
TestingLibraryElementError: Unable to find an element with the text: FilterToolbar.
This could be because the text is broken up by multiple elements.

<body>
  <div>
    <section>
      FilterToolbar    <!-- Text exists but isn't queryable! -->
      Table
    </section>
  </div>
</body>
```

**Problem:**
- Plain string creates bare text node (not wrapped in element)
- RTL's `getByText()` expects text **inside elements**
- Text exists in DOM but query fails
- **Fragile and unpredictable** - sometimes works, sometimes fails

**Fix Applied:**
```typescript
jest.mock('@console/internal/components/filter-toolbar', () => {
  const React = require('react');
  return {
    FilterToolbar: () => React.createElement('div', null, 'FilterToolbar'),  // ✅ Proper element
  };
});
```

**Lesson:** Mock components should return proper React elements, not plain strings. Plain strings create unreliable tests.

---

### Summary: Impact of Fixes

| Issue | Type | Files | Impact |
|-------|------|-------|--------|
| Portal component assertions | False positive | 2 | Tests passed but verified nothing |
| Missing spy restoration | Test pollution | 1 | Spies leaked between tests |
| Null mock returns | False positive | 1 | Assertions always passed |
| Plain string mocks | Test failure | 1 | Tests actually failed |

**Test Results After Fixes:**
- ✅ 4 test suites: ALL PASSING
- ✅ 17 tests: ALL PASSING
- ✅ All false positives eliminated
- ✅ All assertions now meaningful

---

### Key Takeaways from PR #15581

1. **Automated Review Value**: CodeRabbit caught 4 distinct anti-patterns that human reviewers might miss
2. **False Positives Are Worse Than No Tests**: Tests that always pass create false confidence
3. **Portal Components Need Special Handling**: Can't use standard DOM assertions
4. **Mock Quality Matters**: Mocks should return testable, realistic output
5. **Understand Your Tools**: Know the difference between `clearAllMocks()` and `restoreAllMocks()`
6. **Test Your Tests**: Verify your assertions actually test what they claim to test

---

**Created:** 2025-10-17
**Last Updated:** 2025-10-20 (Added PR #15581 CodeRabbit case study)
**Based on:** PR #15611 code review session, PR #15581 CodeRabbit review
**Applies to:** OpenShift Console Enzyme → RTL migrations
**Testing Stack:** Jest 22.x, React Testing Library 12.x

---

## Common Migration Issues & Solutions

### 🚨 Issue 1: Overly Complex Mocks Using require('react')

**❌ WRONG: Complex mocks with require('react')**
```typescript
jest.mock('@console/internal/components/utils', () => {
  const React = require('react');
  const actual = jest.requireActual('@console/internal/components/utils');
  return {
    ...actual,
    Firehose: jest.fn(({ resources, children }) => {
      const props = {};
      if (resources) {
        resources.forEach((resource) => {
          props[resource.prop] = { loaded: false, data: null };
        });
      }
      const childrenWithProps = typeof children === 'function'
        ? children(props)
        : React.isValidElement(children)
        ? React.cloneElement(children, props)
        : children;

      return React.createElement(
        'div',
        { 'data-testid': 'firehose' },
        React.createElement('div', { 'data-testid': 'firehose-resources' }, JSON.stringify(resources)),
        childrenWithProps,
      );
    }),
  };
});
```

**Problems:**
- Overly complex and difficult to maintain
- Uses `require('react')` which adds unnecessary complexity
- Requires understanding of React internals
- Makes tests harder to read and understand

**✅ CORRECT: Simple, focused mocks**
```typescript
// Option 1: Return null (simplest)
jest.mock('@console/internal/components/utils', () => ({
  Firehose: () => null,
}));

// Option 2: Return component name (helpful for debugging)
jest.mock('@console/internal/components/utils', () => ({
  Firehose: () => 'Firehose',
}));

// Option 3: Pass children through (when needed)
jest.mock('@console/internal/components/utils', () => ({
  Firehose: ({ children }: any) => children,
}));

// Option 4: Minimal structure when children need props
jest.mock('@console/internal/components/utils', () => ({
  Firehose: ({ children }: any) => {
    const props = { packageManifest: { loaded: false } };
    return typeof children === 'function' ? children(props) : children;
  },
}));
```

---

### 🚨 Issue 2: Testing Implementation Details

**❌ WRONG: Focus on implementation details**
```typescript
it('renders DetailsPage with correct props', () => {
  render(<CatalogSourceDetailsPage />);

  const kindElement = screen.getByTestId('details-page-kind');
  expect(kindElement).toHaveTextContent(referenceForModel(CatalogSourceModel));

  const pagesElement = screen.getByTestId('details-page-pages');
  const pages = JSON.parse(pagesElement.textContent);
  expect(pages).toHaveLength(3);
  expect(pages[0]).toEqual('public~Details');
});
```

**Problems:**
- Tests internal props, not user-visible behavior
- Requires parsing JSON from test IDs
- Tightly coupled to implementation
- Won't catch bugs that affect users

**✅ CORRECT: Test user-facing behavior**
```typescript
// Mock the DetailsPage component
jest.mock('@console/internal/components/factory', () => ({
  DetailsPage: jest.fn(() => null),
}));

it('passes correct configuration to DetailsPage', () => {
  render(<CatalogSourceDetailsPage />);

  expect(mockDetailsPage).toHaveBeenCalledTimes(1);
  const [detailsPageProps] = mockDetailsPage.mock.calls[0];

  expect(detailsPageProps.kind).toEqual(referenceForModel(CatalogSourceModel));
  expect(detailsPageProps.pages).toHaveLength(3);
  expect(detailsPageProps.pages[0].component).toEqual(CatalogSourceDetails);
});
```

---

### 🚨 Issue 3: Overuse of getByTestId

**❌ WRONG: Heavy reliance on test IDs**
```typescript
it('renders catalog details', () => {
  render(<CatalogSourceDetails obj={obj} />);

  expect(screen.getByTestId('details-item-Name')).toBeInTheDocument();
  expect(screen.getByTestId('details-item-Publisher')).toBeInTheDocument();
  expect(screen.getByTestId('resource-summary')).toBeInTheDocument();
});
```

**Problems:**
- Doesn't test what users actually see
- Adds maintenance burden (data-testid attributes everywhere)
- Doesn't verify accessibility
- Can pass even if content is wrong

**✅ CORRECT: Use semantic queries**
```typescript
it('renders catalog name and publisher', () => {
  render(<CatalogSourceDetails obj={obj} />);

  // Test actual visible content
  expect(screen.getByText(obj.spec.displayName)).toBeVisible();
  expect(screen.getByText(obj.spec.publisher)).toBeVisible();

  // Or test by role/label if applicable
  expect(screen.getByRole('heading', { name: obj.spec.displayName })).toBeVisible();
});
```

**When to use getByTestId:**
- ✅ Testing loading skeletons (no meaningful text/role)
- ✅ Dynamic content where text varies
- ❌ Static text content
- ❌ Buttons, links, headings (use getByRole instead)
- ❌ Form fields (use getByLabelText instead)

---

### 🚨 Issue 4: Using .toBeInTheDocument() Instead of .toBeVisible()

**❌ WRONG: Tests presence, not visibility**
```typescript
it('renders catalog details', () => {
  render(<CatalogSourceDetails obj={obj} />);

  expect(screen.getByText(obj.spec.displayName)).toBeInTheDocument();
  expect(screen.getByText(obj.spec.publisher)).toBeInTheDocument();
});
```

**Problems:**
- Element could be hidden (display: none, visibility: hidden)
- Doesn't match what users actually experience
- Less accurate for testing UI behavior

**✅ CORRECT: Test visibility**
```typescript
it('renders catalog details', () => {
  render(<CatalogSourceDetails obj={obj} />);

  expect(screen.getByText(obj.spec.displayName)).toBeVisible();
  expect(screen.getByText(obj.spec.publisher)).toBeVisible();
});
```

**When to use each:**
- **`.toBeVisible()`** - Default choice for visual elements (text, buttons, images)
- **`.toBeInTheDocument()`** - Non-visual elements (aria-live regions, hidden inputs) or testing absence
- **`.not.toBeInTheDocument()`** - Asserting element doesn't exist

---

### 🚨 Issue 5: Using expect.anything()

**❌ WRONG: Overly permissive assertions**
```typescript
it('passes props to component', () => {
  render(<MyComponent />);

  expect(mockChild).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.anything(), // ← Too permissive!
      onSelect: expect.anything(), // ← Could be undefined!
    }),
    expect.anything(),
  );
});
```

**Problems:**
- Test will pass even if prop is `undefined`, `null`, or wrong type
- Doesn't verify actual values
- Gives false sense of test coverage

**✅ CORRECT: Be specific**
```typescript
it('passes props to component', () => {
  render(<MyComponent />);

  expect(mockChild).toHaveBeenCalledTimes(1);
  const [childProps] = mockChild.mock.calls[0];

  expect(childProps.data).toEqual(expectedData);
  expect(childProps.onSelect).toEqual(expect.any(Function));
  // Or if you need to verify it's called:
  expect(typeof childProps.onSelect).toBe('function');
});
```

---

### 🚨 Issue 6: Not Using renderWithProviders

**❌ WRONG: Missing required context**
```typescript
import { render } from '@testing-library/react';

it('renders component', () => {
  render(<MyComponent />); // ← Missing Redux/Router context
});
```

**Problems:**
- Component crashes if it uses Redux hooks (useSelector, useDispatch)
- Component crashes if it uses Router hooks (useParams, useLocation, useNavigate)
- Need to manually mock all context providers

**✅ CORRECT: Use renderWithProviders**
```typescript
import { renderWithProviders } from '@console/shared/src/test-utils/unit-test-utils';

it('renders component', () => {
  renderWithProviders(<MyComponent />);
});

// Or with custom initial state
it('renders component with custom state', () => {
  const initialState = {
    k8s: {
      /* ... */
    },
  };
  renderWithProviders(<MyComponent />, { initialState });
});
```

---

### 🚨 Issue 7: Converting Difficult Enzyme Tests

Some Enzyme tests focus heavily on implementation details and are difficult to convert to RTL.

**Strategy: Replace, Don't Translate**

```typescript
// ❌ OLD ENZYME TEST (hard to convert)
it('renders correct DOM structure', () => {
  const wrapper = shallow(<CatalogSourceDetails obj={obj} />);

  expect(wrapper.find('.details-container').exists()).toBe(true);
  expect(wrapper.find('.details-container').children()).toHaveLength(3);
  expect(wrapper.find('DetailsItem').at(0).prop('label')).toBe('Name');
  expect(wrapper.find('DetailsItem').at(1).prop('label')).toBe('Publisher');
});
```

**❌ WRONG: Literal translation to RTL**
```typescript
it('renders correct DOM structure', () => {
  render(<CatalogSourceDetails obj={obj} />);

  const container = screen.getByTestId('details-container');
  expect(container.children).toHaveLength(3);
  // ... more implementation-focused checks
});
```

**✅ CORRECT: Write new behavioral test**
```typescript
it('displays catalog source name and publisher', () => {
  render(<CatalogSourceDetails obj={obj} />);

  // Test what users see, not DOM structure
  expect(screen.getByText(obj.spec.displayName)).toBeVisible();
  expect(screen.getByText(obj.spec.publisher)).toBeVisible();
});

it('displays all catalog source details', () => {
  render(<CatalogSourceDetails obj={obj} />);

  expect(screen.getByText(obj.metadata.name)).toBeVisible();
  expect(screen.getByText(obj.spec.displayName)).toBeVisible();
  expect(screen.getByText(obj.spec.publisher)).toBeVisible();
  expect(screen.getByText(obj.spec.sourceType)).toBeVisible();
});
```

**Key Insight:** If an Enzyme test is hard to convert, it's usually because it's testing implementation details. This is an opportunity to write better tests.

---

## Established Team Patterns

Based on team review feedback, these are the established patterns for this migration:

### Pattern: Use renderWithProviders
✅ **Always use** `renderWithProviders` for components that need Redux or Router context
```typescript
import { renderWithProviders } from '@console/shared/src/test-utils/unit-test-utils';

renderWithProviders(<MyComponent />);
```

### Pattern: Query Priority
✅ **Prefer semantic queries** in this order:
1. `getByRole` - Accessible elements (buttons, links, headings)
2. `getByLabelText` - Form fields with labels
3. `getByText` - Text content
4. `getByTestId` - Only for loading skeletons or when semantic queries aren't possible

### Pattern: Visibility Assertions
✅ **Prefer `.toBeVisible()`** for assertions
- Use `.toBeVisible()` for visual elements (default)
- Use `.toBeInTheDocument()` only for non-visual elements or asserting absence

### Pattern: Simple Mocks
✅ **Keep mocks simple**, avoid `require('react')`

Good examples:
```typescript
// Simplest
() => null

// Helpful for debugging
() => 'ComponentName'

// Pass through children
({ children }: any) => children

// Minimal structure
jest.fn((props) => props.children)
```

### Pattern: No expect.anything()
✅ **Avoid `expect.anything()`** - be specific in assertions
```typescript
// ❌ Too permissive
expect(mockFn).toHaveBeenCalledWith(expect.anything());

// ✅ Specific
expect(mockFn).toHaveBeenCalledWith(expectedValue);
expect(mockFn).toHaveBeenCalledWith(expect.any(Function));
```

### Pattern: Focus on Behavior
✅ **Test user-facing behavior**, not implementation details
```typescript
// ❌ Implementation
expect(wrapper.find('div').props().className).toBe('container');

// ✅ Behavior
expect(screen.getByText('Expected Content')).toBeVisible();
```

### Pattern: Replace Hard-to-Convert Tests
✅ **When Enzyme tests focus on implementation details**, replace with new behavioral tests rather than literal translations

---

## Updated Migration Checklist

- [ ] ✅ Uses `renderWithProviders` for components needing context
- [ ] ✅ Prioritizes semantic queries (`getByRole`, `getByLabelText`, `getByText`)
- [ ] ✅ Uses `getByTestId` minimally (only for loading skeletons)
- [ ] ✅ Prefers `.toBeVisible()` for assertions (fallback to `.toBeInTheDocument()` for non-visual)
- [ ] ✅ Keeps mocks simple, avoids `require('react')`
- [ ] ✅ Avoids `expect.anything()` in assertions
- [ ] ✅ Focuses on user-facing behavior, not implementation details
- [ ] ✅ Replaces difficult Enzyme tests with new behavioral tests
- [ ] ❌ No meaningless assertions (`expect(container).toBeInTheDocument()`)
- [ ] ❌ No JSX in `jest.mock()` factory functions
- [ ] ❌ No complex mocks with `React.createElement` chains
- [ ] ❌ No testing of internal props via JSON parsing from test IDs
- [ ] ❌ No overuse of `getByTestId` for standard UI elements

---

## Changelog

### 2025-10-23 - PR #15581 Patterns Added as Best Practice Rules
- Removed **Rule 6: Mock Components Must Return Proper React Elements** (no longer required for evaluation)
- Added **Rule 6: Testing Context Providers** with test component pattern for verifying provider behavior
- Added **Rule 7: Using container.firstChild - When and How** documenting when to use container.firstChild (null assertions only)
- Added **Rule 8: Testing Conditional Rendering** emphasizing both positive and negative test cases
- Added **Rule 9: DRY Test Setup with beforeEach** for complex props management
- Added **Rule 10: Mocking Formik Hooks** for testing Formik-based components efficiently
- Added **Pattern 4: Enzyme wrapper.find() → RTL Mock Verification** showing child component mocking approach
- Updated migration checklist with 5 new items:
  - Context provider testing with test components
  - Conditional rendering positive/negative assertions
  - DRY props setup with beforeEach
  - Formik hook mocking patterns
  - Child component mock verification
- All new rules based on excellent patterns demonstrated in PR #15581 console-shared migration
- Source files: `ToastProvider.spec.tsx`, `Spotlight.spec.tsx`, `CustomResourceList.spec.tsx`, `SelectorInputField.spec.tsx`

### 2025-10-20 - CodeRabbit PR #15581 Findings Added
- Added **Rule 4: Testing Portal-Based Components** with patterns for tooltips, popovers, and modals
- Added **Rule 5: Mock Spy Cleanup** documenting `restoreAllMocks()` vs `clearAllMocks()` differences
- Added **Rule 6: Mock Components Must Return Proper React Elements** explaining plain string vs React element issues
- Added **Real-World Case Study: PR #15581 CodeRabbit Review** with detailed analysis of:
  - Portal component false positive assertions
  - Spy pollution from missing mock restoration
  - Null mock returns creating false positives
  - Plain string mocks causing unreliable queries
- Updated migration checklist with 6 new items covering:
  - Portal component testing patterns
  - Spy restoration requirements
  - Mock return value quality
- Added PR #15581 to reference examples
- Documented how CodeRabbit CLI caught 4 anti-patterns in automated review
- Based on CodeRabbit review of console-shared package Enzyme → RTL migration

### 2025-10-17 - Team Review Patterns Added
- Added **Common Migration Issues & Solutions** section with 7 detailed anti-patterns
- Documented established team patterns from code review feedback
- Added guidance on:
  - Avoiding overly complex mocks with `require('react')`
  - Testing behavior vs implementation details
  - Proper use of semantic queries vs `getByTestId`
  - When to use `.toBeVisible()` vs `.toBeInTheDocument()`
  - Why `expect.anything()` should be avoided
  - Using `renderWithProviders` for context
  - Replacing hard-to-convert tests instead of literal translation
- Updated migration checklist with new team standards
- Based on review of CONSOLE-4605 initial migration attempt

### 2025-10-17 - Detailed Improvements Documentation
- Added **Real-World Case Study** section documenting PR #15611 improvements
- Enhanced Pattern 2 with detailed comparison tables showing error messages and benefits
- Added specific examples of:
  - Why `expect(container).toBeInTheDocument()` is meaningless
  - How `mock.calls[0][0]` vs `[props] = mock.calls[0]` differ in error handling
  - Why `toMatchObject()` is superior to `toBe()` for prop assertions
  - JSX-in-mock constraint and pragmatic solution
- Created summary table of all changes made to PR #15611
- Documented lessons learned from each issue encountered
