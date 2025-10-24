# React Component Unit Testing Best Practices

## Use React Testing Library (RTL)

There are numerous libraries to render React components during Jest unit tests including Enzyme, but all future tests shall be written using React Testing Library (RTL).

### The RTL Approach

When using RTL, the main approach is to test as users would test. For example, when finding a button, a user would look for a button object with a given text. Users do not identify a button by the CSS class, id, or test id. When writing selectors, we want to select on what the user is seeing (role, text, etc) instead of items hidden in the HTML.

In addition, since a user sees the entire rendered component, the same should be true when performing unit tests. By default, RTL does this, and mocking whole components should be avoided.

## Using RTL (intro)

When a new component is created, new tests should be written in RTL.

When an existing component is updated, all existing tests should be converted to RTL using the best practices outlined in this document. This update includes adding tests where there are holes in the test coverage. If the updated component is part of a time-sensitive urgent bug, at the very least, all the appropriate "todo" tests will be written (see section below). It is expected that this situation is rare.

Migrating from Enzyme to RTL: https://testing-library.com/docs/react-testing-library/migrate-from-enzyme/

---

## Testing Files in Same Directory as Component File

For every file that exports at least one React component, there is a corresponding test file in the same directory as the component file. The file should have the same name, but ending with `.test.jsx` or `.test.tsx`. Do not use `.spec.` for file names.

**Example:**

```
* MyComponentDirectory
   * MyComponent.test.tsx
   * MyComponent.tsx
```

If updating an existing component file, the corresponding test file should be moved to the same directory and re-named if necessary.

---

## Test Grouping

All the tests for a component shall be in a describe block where the description is component name.

If there are numerous tests, like tests shall be grouped in a child describe block.

```javascript
describe('<MySampleComponent />', () => {
  describe('Test validation', () => {
    // a bunch of tests
  });

  describe('Test submission errors', () => {
    // a bunch of tests
  });
});
```

---

## Use 'it()'

Jest allows the use of both the 'test' and 'it' methods to define a test. All tests should use the 'it' method.

**Example:**

```javascript
it('displays "hello" when "hello" is sent as a prop', () => {...});
```

---

## Test Spacing

There should be a single empty line between tests.

```javascript
it('displays "hello" when "hello" is sent as a prop', () => {...});

it('is accessible on initial render', () => {...});
```

---

## Test Description (end result when)

The test description should clearly describe what the end result will be along with the exact conditions needed to get the expected result. This allows future developers to quickly understand what each test does without analyzing the test code. Non-descriptive descriptions like "it works", "it renders", etc. shall not be used.

**Format shall be:**

> Expected result when conditions

**Examples:**

```javascript
it('displays "hello" when "hello" is sent as a prop', () => {...});

it('displays only the Overview, Access control, and Networking tabs when using default prop values', () => {...});

it('shows an alert when the api call to get the cluster details fails', () => {...});

it('shows the node count has increased by 1 when the user clicks on the "+" button', () => {...});
```

Concise descriptions are valued, but longer descriptions are completely appropriate in order to effectively describe the test.

---

## Test Structure (using modified AAA format)

In order to make the test itself more readable, each test should be broken down into three areas:
* **Arrange** => get the component ready to be tested. If there is an act part of the test, assert that the component is in an expected state before changes
* **Act** => perform any user action and/or data changes
* **Assert** => test the component is in the expected state

**Example:**

```javascript
it('displays welcome banner when "welcome" button is pressed', () => {
  // Arrange
  const alertMessage = 'Welcome to our site Kim!';
  render(<MySampleComponent name="Kim" />);
  expect(screen.queryByRole('alert', { name: alertMessage })).not.toBeInTheDocument();

  // Act
  userEvent.click(screen.getByRole('button', { name: 'Welcome' }));

  // Assert
  expect(screen.getByRole('alert', { name: alertMessage })).toBeInTheDocument();
});
```

**NOTE:** Not all tests will have an act step - especially if the test is to assert that the component is in a certain state immediately after render.

Although helpful, adding the comments isn't necessary but it should be obvious to future readers that these steps are followed in this order.

---

## Test Boundaries

When creating a test, it is important to test all paths through the code of the component you are writing the test for. For example if you have an if statement in your code, this generally means that you will need two tests - one to cover the path in the if statement and one to cover the else path.

With this said, only test logic that is introduced into the component. There isn't a need to test imported components or libraries.

---

## Keep Tests DRY While Avoiding Over Abstraction

The end goal is to ensure that each test is readable in isolation. With that said, we don't want a situation where a single change (like a new required prop) would require modifying many individual tests.

Things like text used for matching, initial props and set-up steps can be abstracted into helper functions that are contained outside all describe blocks and are defined at the top of the test file they are used.

While abstracting duplicate code into a helper, make sure that your tests are simple and easily readable - this may mean that you may error on duplicating code over creating an overly complex helper.

---

## Keep Tests Small and Focused (test a single item/state at a time)

Unlike functional or end-to-end tests which can become rather lengthy, for unit tests it is ideal to keep them short and only testing a single state.

This will mean that there will be many smaller unit tests.

---

## Avoid Snapshot or "it renders" Tests

While, on the surface snapshot tests seem like an easy way to create a test, in practice snapshot tests do not catch bugs and give a false sense of confidence in test coverage. They discourage a test driven development (TDD) approach. In addition, it is unclear exactly what is supposed to be tested.

Checking to see if the component renders anything doesn't provide a lot of value, React itself has been well tested and we don't need to verify it will render information it is given.

**Avoid:**

```javascript
it('renders', () => {
  // Arrange
  const {container} = render(<MySampleComponent name="Kim" />);

  // Assert
  expect(container).toMatchSnapshot();
});
```

**Better:**

```javascript
it('displays "Hello Kim" when "Kim" is sent as a prop on initial render', () => {
  // Arrange
  render(<MySampleComponent name="Kim" />);

  // Assert
  expect(screen.getByText('Hello Kim')).toBeInTheDocument();
});
```

---

## Accessibility Testing

While automated accessibility tests only catch around 20% of the accessibility issues, adding automated accessibility tests is easy and should be added for each component using the axe-core library.

Each state of the component should be tested for accessibility. Ideally accessibility checks would be separate tests, but accessibility checks can be added to other tests if the tests include a state change.

```javascript
import { render, screen, checkAccessibility } from '@testUtils';

it('is accessible on initial render', async () => {
  // Arrange
  const {container} = render(<MySampleComponent name="Kim" />);

  // Assert
  await checkAccessibility(container);
});

it('displays welcome banner when "welcome" button is pressed AND is accessible', async () => {
  // Arrange
  const alertMessage = 'Welcome to our site Kim!';
  const {container} = render(<MySampleComponent name="Kim" />);
  expect(screen.queryByRole('alert', { name: alertMessage })).not.toBeInTheDocument();

  // Act
  userEvent.click(screen.getByRole('button', { name: 'Welcome' }));

  // Assert
  expect(screen.getByRole('alert', { name: alertMessage })).toBeInTheDocument();
  await checkAccessibility(container);
});
```

If there is an accessibility issue that can't be resolved because it is from an external library (like PatternFly) do the following:
* Make the accessibility test a "skip" test (see section below)
* Add an explanation to the test describing why the test is being skipped
* Check for an existing bug on the external library's site. If one doesn't exist, then create a new one.
* Add the URL to the bug as a comment in the test.

---

## Write 'todo' Tests Before Coding

Ideally, tests will be written and coded before making changes to the actual application. The feature is complete once all the tests pass. This isn't always possible. Before starting new work, at the very least "todo" tests should be created describing how the application should behave.

```javascript
it.todo('displays "Hello Kim" when "Kim" is sent as a prop on initial render');
```

These todo tests should be checked into git if there is a need to merge the code to master before the tests are done.

---

## Skip Tests That Are Producing Unexpected Results

If a test is producing unexpected results, it should be skipped along with an explanation of why the test is being skipped. By skipping the test it is a signal to future developers that this is something that should be tested but there is an issue that should be addressed in the future.

```javascript
it.skip('is accessible on initial render', async () => {
  // NOTE: This test is skipped because of an accessibility error
  // from an external library. This has been recorded in
  // https://www.github.com/externalUIlibrary/issues/123

  // Arrange
  const {container} = render(<MySampleComponent name="Kim" />);

  // Assert
  await checkAccessibility(container);
});
```

These skip tests should be checked into git. Do not comment out or remove valid failing tests.

---

## Query Types

There are three types of queries available in RTL (getBy…, queryBy…, findBy…). It is important to use them in the correct way.

| Query - expect single result | Query - expect multiple results | When to use |
|------------------------------|--------------------------------|-------------|
| getBy… | getAllBy… | When you expect that the item(s) exist |
| queryBy… | queryAllBy… | When you expect that the item(s) do not exist |
| findBy… | findAllBy… | When you want the code to wait until the item(s) are available |

See: https://testing-library.com/docs/queries/about#types-of-queries for more description.

---

## Selector Preference Order

When trying to find an object(s) in a component with RTL, the following selectors should be used in this preference order:

1. **getByRole** (accessibility tree role - often combined with text) - [getByRole information and examples](https://testing-library.com/docs/queries/byrole)
2. **getByLabelText** (used with form elements): getByLabelText finds the input element, not the label element. It is designed to find the form element associated with a label, not the label itself. For example, if you have `<label for="username-input">Username</label><input id="username-input" />`, `screen.getByLabelText('Username')` will return the `<input>` element.
3. **getByPlaceholderText** (used with form elements)
4. **getByText**
5. **getByDisplayValue** (used with form elements)
6. **getByAltText** (used with images)
7. **getByTitle** (only if title attribute is appropriate)
8. **getByTestId***

The reasoning is that we want to use items in the same way users find items. This often means by searching by text strings. The instability of using text matching can be reduced by using partial text matching, regular expressions, and variabilization.

When the above priority is followed, the code will generally be more accessible because writing code that is testable with the above priority in mind tends to be more accessible code.

**NOTE:** Do not force an inappropriate role, alt text, or title just for testing purposes. Role, alt, and title attribute must be appropriate for the situation.

*If getByTestId is used, an explanation of why no other method would work in this situation is required.

**Example of when to use getByTestId:**

```javascript
it('smiley face is shown when "isSmiley" is passed as a prop', () => {
  // Arrange
  render(<MySampleComponent isSmiley />);

  // Assert
  // NOTE: getByTestId is used because the SmileyFace component
  // doesn't render a role or accessible text.
  expect(screen.getByTestId('mySmileyFaceTestId')).toBeInTheDocument();
});
```

**Tools:**

Testing Playground is a Chrome extension that will suggest selectors based on this preference order.

---

## Render in Each Test

In order to ensure it is clear what is rendered for each test, rendering shall happen within the test itself. This means that rendering should not happen inside a beforeAll, beforeEach, or other similar helper.

In order to reduce duplicate code, props that are applied in each test can be saved as a variable.

```javascript
const props = { isSmiley: true, name: 'Kim' };

describe('<MySampleComponent />', () => {
  it('is accessible on initial render', async () => {
    const { container } = render(<MySampleComponent {...props} />);
    await checkAccessibility(container);
  });

  it('shows "Kim" when passed as a prop', () => {
    render(<MySampleComponent {...props} />);
    expect(screen.getByText('Hello Kim')).toBeInTheDocument();
  });

  it('shows SmileyFace when passed as a prop', () => {
    render(<MySampleComponent {...props} />);
    expect(screen.getByAltText('smiley face')).toBeInTheDocument();
  });

  it('does not show SmileyFace when false is passed as a prop', () => {
    const newProps = { ...props, isSmiley: false };
    render(<MySampleComponent {...newProps} />);
    expect(screen.queryByAltText('smiley face')).not.toBeInTheDocument();
  });
});
```

---

## Test Independence

Each test, describe block, and file should be able to be run singularly and as part of the entire test suite with the same results.

In order to achieve this, it is important to ensure that actions taken in one test do not impact another test or persist after the test. Take extra care when:
* Using beforeEach, beforeAll, afterEach, afterAll methods
* Nesting describe blocks
* Changing the value of a variable - especially during a beforeEach, beforeAll, afterEach, afterAll blocks

See [Avoid Nesting when you're Testing](https://kentcdodds.com/blog/avoid-nesting-when-youre-testing)

---

## Use "user" Helper Object

When testing user interactions like typing or clicking, use the user helper method that is returned on render. This object has a configuration that works best with the code base. Do not directly use userEvent or fireEvent.

```javascript
it('displays "hello" when button is clicked', async () => {
  // Arrange
  const { user } = render(<MySampleComponent />);
  expect(screen.queryByText('hello')).not.toBeInTheDocument();

  // Act
  await user.click(screen.getByRole('button'));

  // Assert
  expect(screen.getByText('hello')).toBeInTheDocument();
});
```

### Simulating Typing

When RTL simulates a user typing into a textbox, it does not empty the textbox first. Clear the textbox before simulating typing.

```javascript
it('displays "world" when user types "hello"', async () => {
  // Arrange
  const { user } = render(<MySampleComponent />);
  expect(screen.queryByText('world')).not.toBeInTheDocument();

  // Act
  await user.clear(screen.getByRole('textbox'));
  await user.type(screen.getByRole('textbox'), 'hello');

  // Assert
  expect(screen.getByText('world')).toBeInTheDocument();
});
```

---

## Use 'within' Instead of querySelector (when possible)

Often there are times when you want to find an element inside another element. For example you want the first list item inside the first tab. While RTL does allow for the use of querySelectors, the within helper is preferred.

```javascript
it('has the text "hello world" in the first list item', () => {
  // Arrange
  render(<MySampleComponent />);

  // Assert
  const FirstLI = within(screen.getAllByRole('tabpanel')[0])
    .getAllByRole('listitem')[0];

  expect(FirstLI).toHaveTextContent('hello world');
});
```

---

## Use findBy Instead of waitFor (when possible)

If there is a state change in a component (either onmount or due to a user action) there may be a short time delay before the component is rerendered. This can cause tests to fail. RTL has two ways to wait for an expect statement to pass - waitFor and findBy (or findAllBy). The findBy or findAllBy selectors are preferred to ensure consistency across tests.

```javascript
it('displays error when api call fails on initial render', async () => {
  // Arrange
  render(<MySampleComponent />);

  // Assert
  expect(await screen.findByRole('alert')).toBeVisible();
});
```

**NOTE:** There is an existing RTL bug where if you set an element when using findBy in a later assert, this may cause intermittent unit test failures on CI.

**Avoid:**

```javascript
it('displays error when api call fails on initial render', async () => {
  // Arrange
  render(<MySampleComponent />);

  // Assert
  const myAlert = await screen.findByRole('alert');
  expect(myAlert).toBeVisible();
});
```

---

## Use toBeInTheDocument to Test if an Item Exists

There are many approaches available if you want to check if an element exists. Best practice is to use the `toBeInTheDocument()` assertion. This makes it very clear what you are testing (that it exists).

**Avoid:**

```javascript
it('displays "Kim" when passed as a prop', () => {
  // Arrange
  render(<MySampleComponent name="Kim" />);

  // Assert
  expect(screen.getByText('Kim')).toBeTruthy();
  expect(screen.getAllByText('Kim')).toHaveLength(1);
  expect(screen.getByText('Kim')).toBeVisible();
  expect(screen.queryByText('Fish')).toBeFalsy();
  expect(screen.queryAllByText('Fish')).toHaveLength(0);
});
```

**Best:**

```javascript
it('displays "Kim" when passed as a prop', () => {
  // Arrange
  render(<MySampleComponent name="Kim" />);

  // Assert
  expect(screen.getByText('Kim')).toBeInTheDocument();
  expect(screen.queryByText('Fish')).not.toBeInTheDocument();
});
```

**NOTE:**

If an element's visibility changes via CSS and you want to test if an element is currently visible, then use `.toBeVisible()`. See [toBeVisible() documentation](https://github.com/testing-library/jest-dom#tobevisible)

---

## Helpful Tips

### Logging HTML

You can log the HTML of the component at any time using `screen.debug()`. There is a limit on how many lines of code are printed to the console. If you want all rendered component html in the console, use the following: `screen.debug(undefined, Infinity)`

### Logging Roles (used in getByRole)

You can log out the aria roles of an object (including the entire component) and its children using `logRoles()`. This is incredibly helpful when using the getByRole selector.

```javascript
const {container} = render(<MySampleComponent />);

// entire component:
logRoles(container);

// single element
logRoles(screen.getByText('my favorite item'));
```

### Waiting for Element to be Removed

While the findBy selectors will wait for the appearance of an object, you can use the `waitForElementToBeRemoved()` helper to wait until an object has been removed from the DOM.

**NOTE:** There is an existing RTL bug where if you save an element to a variable and then pass this variable to `waitForElementToBeRemoved()` causing intermittent unit test failures on CI.

**Avoid:**

```javascript
it('displays error when api call fails on initial render', async () => {
  // Arrange
  render(<MySampleComponent />);

  // Assert
  const myAlert = screen.getByRole('alert');
  await waitForElementToBeRemoved(() => myAlert);
});
```

### Custom Matchers

The React Testing Library has added custom matchers that you can use with your expect statements. For example you can verify that a checkbox has been checked.

```javascript
it('the first checkbox is checked on initial render', () => {
  // Arrange
  render(<MySampleComponent />);

  // Assert
  expect(screen.getAllByRole('radio')[0]).toBeChecked();
});
```

### Fixing "not wrapped in act" Errors/Warning

There are times when the tests may finish, but throws the following warning/error in the console: "An update to … inside a test was not wrapped in act(...) ".

There are numerous reasons why this may happen, but the most common is that the test finished before the rendering was fully completed. This can happen if there are a lot of child components, updates on mount, or complex rendering.

The fix is to have the test check for something that would happen after a full render using the findBy selectors (ideal) or using waitFor.

```javascript
it('displays hello on initial render', async () => {
  // Arrange
  render(<MySampleComponent />);

  // Assert
  expect(await screen.getByText('hello')).toBeInTheDocument();

  await waitFor(() => {
    expect(myMockedFunction).toHaveBeenCalled();
  });
});
```

### i18n Testing

https://react.i18next.com/misc/testing#example-test-using-this-configuration

---

## Pro Tips

1. **Remove redundant code** - i.e. assertions
2. **Default rule:** Use `toBeVisible()` for anything users interact with, while `toBeInTheDocument()` for structural/conditional rendering tests
3. **The act method** - Utilities like render, fireEvent, and waitFor often handle act internally, reducing the need for explicit act calls in many common testing scenarios. You should primarily use act when encountering the "not wrapped in act" warning or when dealing with complex asynchronous updates that require precise timing for assertions
4. **Fix the act method warning** - Use the async/await and findBy* queries
5. **Default to getByText for most cases** - It provides better error messages and catches missing elements early. Use queryByText specifically for:
   - Negative assertions (toBeNull, not.toBeInTheDocument)
   - Conditional checks before assertions
   - Testing element absence after user interactions
6. **Use container.querySelector when multiple elements exist** - Instead of document.querySelector. Use semantic queries like form role instead of containers
7. **Query for what the user would expect to see/not see**
8. **Established RTL Best Practices:**
   - Semantic Queries - getByRole, getByLabelText, getByText
   - User-Centric Testing - Focus on what users see/interact with
   - DRY Helper Functions - Reduce repetitive mock setup
   - Proper Providers - Use renderWithProviders when needed
   - Accessibility-First - Test with screen readers in mind
9. **Benefits of semantic queries:**
   - More Robust Testing - Verifies both the button exists AND has the correct accessible name
   - Better RTL Practices - Uses semantic queries that match how users interact with the UI
   - Cleaner Assertions - Single assertion instead of separate button + text checks
   - Accessibility Focus - Tests the button's accessible name (what screen readers announce)
10. **Use exact text match** - Instead of regex if the text is not displayed in a wrapper node, else fallback to regex without the `i` flag (case-insensitive matching)
11. **The act() warnings** - Are happening because React state updates are occurring after the component renders. Wrap the assertions in waitFor to handle the async state updates
12. **Edge case:** Test the implementation details if the component's only job is prop passing
13. **"Component should exist" tests are generally not recommended** - They don't test any user-facing behavior and other tests already verify the component renders. Instead, test actual behavior (e.g., button shows, component hidden)
