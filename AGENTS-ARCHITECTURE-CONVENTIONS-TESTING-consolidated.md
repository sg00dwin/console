# AGENTS.md – **Machine-readable briefing for all AI coding agents**  
(Claude Code, GitHub Copilot, Cursor, Gemini Code Assist, CodeRabbit, etc.)

This is the entry point for AI-assisted development. Read this first and follow links for details.

## Usage
All AI assistants reference these files to understand:
- Project architecture and key packages
- Development workflows and commands  
- Code conventions and best practices
- Testing and deployment procedures

## Project Overview
- **Monorepo:** `frontend/` (React + TypeScript, yarn workspaces), `pkg/` - Go backend code, `cmd/` - Go CLI commands
- **Dynamic plugins:** `frontend/packages/` (dev-console, knative, helm, pipelines, etc.)
- **Key Packages:** `@console/dynamic-plugin-sdk` (public API—no breaking changes), `@console/shared` (utils), `@console/internal` (core UI/k8s)

## Quick Start
```bash
# Clone & install
git clone https://github.com/openshift/console.git && cd console
make install          # yarn + go deps

# Development server
make start

# Core commands
make lint             # ESLint + Prettier
make test             # Jest unit + Cypress E2E
make build            # Production build

# Backend
./build-backend.sh debug
./test-backend.sh
```

### Frontend Development Commands
- **Build**: `cd frontend && yarn build`
- **Dev server**: `cd frontend && yarn dev`
- **Run tests**: `cd frontend && yarn test`
- **Lint code**: `cd frontend && yarn lint`
- **Update i18n keys**: `cd frontend && yarn i18n`

## Global Practices

### Commit Strategy
- **Backend dependency updates**: Separate vendor folder changes into their own commit to isolate core logic changes
- **Frontend i18n updates**: Run `yarn i18n` and commit updated keys alongside any code changes that affect i18n
- **Redux migration**: When possible during story work, migrate away from Redux/Immutable.js to React hooks/Context without increasing scope

### Branch Naming
- Feature work: `CONSOLE-####` (Jira story number)
- Bug fixes: `OCPBUGS-####` (Jira bug number)
- Base branch: `main` (not master)

## Required Reference Files for AI Coding Agents

**Always** follow the links below for comprehensive, up-to-date guidance. These files are the single source of truth for architecture, coding standards, and testing — do not rely solely on this summary.

- **[ARCHITECTURE.md](ARCHITECTURE.md)**
- **[CONVENTIONS.md](CONVENTIONS.md)**
- **[TESTING.md](TESTING.md)**
- **[README.md](README.md)**
- **[CONTRIBUTING.md](CONTRIBUTING.md)**
- **[STYLEGUIDE.md](STYLEGUIDE.md)**  
- **[INTERNATIONALIZATION.md](INTERNATIONALIZATION.md)** 

**Tool-specific:**
- Claude → [CLAUDE.md](CLAUDE.md) and `.claude/`  
- Cursor → `.cursor/context.md`  
- CodeRabbit → [coderabbit.yaml](coderabbit.yaml)

**Rule for all agents**: Before generating or modifying code, consult the relevant file(s) above to ensure full compliance.

# ARCHITECTURE

## Console Dynamic Plugin SDK

The `console-dynamic-plugin-sdk` is a key part of this repository - it's the public API that enables OpenShift Console's extensibility.


- **Extension Points System**: 25+ extension types (NavItem, Page, ResourceListPage, DashboardsCard, etc.)
- **Module Federation**: Runtime plugin loading via Webpack Module Federation
- **Type Safety**: Comprehensive TypeScript definitions for all extension points
- **Code References**: Lazy loading with `$codeRef` for performance
- 
### Key Extension Types (reference)

| Category       | Types                                                      | Purpose                          |
|----------------|------------------------------------------------------------|----------------------------------|
| Navigation     | NavItem, HrefNavItem, Separator                            | Sidebar / top nav                |
| Pages          | Page, RoutePage, StandaloneRoutePage                       | Full or nested pages             |
| Resources      | ModelDefinition, ResourceListPage, ResourceDetailsPage     | CRUD views                       |
| Actions        | ActionGroup, ResourceActionProvider                        | Kebab / row menus                |
| Dashboards     | DashboardsCard, DashboardsTab                              | Overview health cards            |
| Catalog        | CatalogItemType, CatalogItemProvider                       | Operator / Helm catalog          |
| Perspectives   | Perspective, PerspectiveContext                            | Top-level views                  |


### Plugin Structure
```typescript
// ✅ GOOD – Dynamic extensions (runtime-loaded)
export const plugin: Plugin = [
  {
    type: 'Page',
    properties: {
      exact: true,
      path: '/my-plugin-page',
      component: { $codeRef: 'MyPluginPage' },  // Lazy-load reference
    },
  },
  {
    type: 'NavItem',
    properties: {
      section: 'home',
      componentProps: { name: 'My Plugin', href: '/my-plugin-page' },
    },
  },
];

// ❌ BAD – Static (avoid—breaks extensibility)
export const staticPlugin = { extensions: [...] };
```

### Critical Considerations
- **⚠️ BREAKING CHANGES REQUIRE EXTREME CARE**: This is a public API consumed by external plugins
- **Backward Compatibility**: Must maintain compatibility across versions
- **Schema Evolution**: Extension schema changes need migration paths
- **Performance Impact**: Plugin loading affects console startup time
- **Type Safety**: Strong TypeScript support prevents runtime errors

### ⚠️ Public API Sources - Breaking Change Risk
The dynamic plugin SDK re-exports APIs from multiple Console packages. **Changing these source modules could inadvertently break the public API**:

#### APIs Re-exported from `@console/shared`
- **Dashboard Components**: `ActivityItem`, `ActivityBody`, `RecentEventsBody`, `OngoingActivityBody`, `AlertsBody`, `AlertItem`, `HealthItem`, `HealthBody`, `ResourceInventoryItem`, `UtilizationItem`, `UtilizationBody`, `UtilizationDurationDropdown`, `VirtualizedGrid`, `LazyActionMenu`
- **UI Components**: `Overview`, `OverviewGrid`, `InventoryItem`, `InventoryItemTitle`, `InventoryItemBody`, `InventoryItemStatus`, `InventoryItemLoading`, `StatusPopupSection`, `StatusPopupItem`, `DocumentTitle`, `Timestamp`, `ActionServiceProvider`, `ErrorBoundaryFallbackPage`, `QueryBrowser`
- **Hooks**: `useUtilizationDuration`, `useDashboardResources`, `useUserSettings`, `useAnnotationsModal`, `useDeleteModal`, `useLabelsModal`, `useActiveNamespace`, `useQuickStartContext`
- **Other**: `PaneBody` (via `ListPageBody`)

#### APIs Re-exported from `@console/internal`  
- **Core UI**: `HorizontalNav`, `VirtualizedTable`, `TableData`, `ListPageHeader`, `ListPageCreate`, `ListPageCreateLink`, `ListPageCreateButton`, `ListPageCreateDropdown`, `ListPageFilter`, `ResourceLink`, `ResourceIcon`, `ResourceEventStream`, `NamespaceBar`
- **Editors**: `YAMLEditor`, `CodeEditor`, `ResourceYAMLEditor`
- **Hooks**: `useActiveColumns`, `useListPageFilter`, `usePrometheusPoll`, `useURLPoll`
- **K8s Utilities**: Redux store access, HTTP utilities

#### APIs Re-exported from `@console/plugin-sdk`
- **Extension System**: `useExtensions` (via `useResolvedExtensions`)
- **Plugin Infrastructure**: Plugin loading, subscription services, store management

#### APIs Re-exported from `@console/app`
- **Application Context**: `QuickStartsLoader`, `useLastNamespace`

**Before modifying any of these source packages, verify impact on the dynamic plugin SDK public API.**

### SDK Utilities
- **Resource Hooks**: `useK8sWatchResource`, `useActivePerspective`, `useActiveNamespace`
- **Component Utilities**: Navigation helpers, telemetry, validation
- **Build Integration**: `ConsoleRemotePlugin` for Webpack Module Federation

### Development Guidelines
- Always consider impact on external plugin developers
- Extensive testing required for any API changes
- Clear deprecation paths with version-based removal
- Comprehensive documentation for all public APIs
- Performance monitoring for plugin loading

---

# CONVENTIONS

## Frontend Code Conventions
- TypeScript + React, follows existing ESLint rules
- Follow PatternFly design system
- Prefer functional programming patterns and immutable data structures

## Frontend Patterns
- **State Management**: React hooks and Context API (migrating away from legacy Redux/Immutable.js)
- **Hooks**: Use existing hooks from `console-shared` when possible (`useK8sWatchResource`, `useUserSettings`, etc.)
- **API calls**: Use k8s resource hooks for data fetching, `consoleFetchJSON` for HTTP requests
- **Routing**: Plugin routes go in plugin-specific route files
- **Extensions**: Use console extension points for plugin integration
- **Types**: Check existing types in `console-shared` before creating new ones
- **Dynamic Plugins**: Prefer implementing new features using the console dynamic plugin SDK (`frontend/packages/console-dynamic-plugin-sdk/`) for extensibility
- **Plugin SDK Changes**: Any updates to `console-dynamic-plugin-sdk` must maintain backward compatibility as it's a public API
- **Styling**: SCSS modules co-located with components, PatternFly design system components
- **i18n**: Use `useTranslation()` hook with `%namespace~key%` format for translation keys
- **Error Handling**: Use ErrorBoundary components and graceful degradation patterns
- **File Naming**: PascalCase for components, kebab-case for utilities, `*.spec.ts(x)` for tests

## Backend / Go Patterns
- **Package organization**: Follow domain-based structure in /pkg/ (auth, server, proxy, etc.)
- **Error handling**: Use typed errors with NewInvalidFlagError, FatalIfFailed patterns.
- **HTTP handlers**: Use middleware composition, method-based routing, consistent JSON responses via serverutils.SendResponse.
- **Security**: Apply security headers, CSRF protection, proper token validation.
- **Logging**: Use klog with appropriate levels (V(4) for debug, Error, Fatal).
- **Configuration**: YAML-based config with comprehensive flag validation.
- **Testing**: Table-driven tests, httptest for HTTP handlers, proper cleanup functions.
- **K8s clients**: Separate config from client creation, use both typed and dynamic clients.
- **Interfaces**: Define clear interfaces for testability and dependency injection.



### Code Quality
**Use modern JavaScript**
```typescript
// ❌ BAD
const newObj = Object.assign({}, oldObj, { key: 'value' });

// ✅ GOOD
const newObj = { ...oldObj, key: 'value' };
```

**Add comments for complex logic**
```typescript
// ✅ GOOD - Explaining non-obvious code
/**
 * This function is named 't' to trick the i18n parser.
 * Since getGuidedTour returns a static object, we don't
 * have access to React hooks to use useTranslation directly.
 */
const t = (key: string) => i18next.t(key);
```

### Performance
**Optimize re-renders**
```typescript
// ❌ BAD - Recreates function every render
const handleClick = () => doSomething();

// ✅ GOOD - Memoized callback
const handleClick = useCallback(() => doSomething(), []);
```

**Lazy loading**
```typescript
// ✅ GOOD - Lazy load heavy components
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
```

### Patterns
**TypeScript Type Safety**
```typescript
// ❌ BAD - Using 'any'
const data: any = fetchData();

// ✅ GOOD - Proper typing
interface ResourceData {
  name: string;
  namespace: string;
}
const data: ResourceData = fetchData();
```

**Action**: Flag use of `any` type
- Suggest proper type definitions
- Check that null/undefined are handled: `string | undefined`
- Verify exported types for reusable components

**Type component props properly**
```typescript
// ❌ BAD - Duplicating type definitions
interface MyComponentProps {
  appendTo: HTMLElement | (() => HTMLElement) | 'inline';
}

// ✅ GOOD - Reuse from existing component
interface MyComponentProps {
  appendTo?: React.ComponentProps<typeof Popper>['appendTo'];
}
```

**Use proper hooks**
```typescript
// ✅ GOOD - Use useDynamicPluginInfo for plugin data
const [pluginInfoEntries] = useDynamicPluginInfo();
const pluginInfo = useMemo(
  () => pluginInfoEntries.find(entry => entry.pluginName === name),
  [pluginInfoEntries, name]
);
```

### Dynamic Plugin
**Action**: Check if PR still uses static extensions
```typescript
// ❌ BAD - Static extension
export const plugin: Plugin = {
  extensions: [/* ... */]
};

// ✅ GOOD - Dynamic extension
export const useDynamicExtensions = () => {
  return useMemo(() => [/* ... */], []);
};
```

### Circular Dependencies
**Problem:** Barrel exports (index.ts files that re-export multiple modules) can create circular dependency cycles that cause runtime errors, `undefined` values, and build issues.

```typescript
// ❌ BAD - Index.ts barrel export causing cycles
import { Component } from '@console/shared';

// ✅ GOOD - Direct import to specific file
import { Component } from '@console/shared/src/components/Component';
```

### Import Management

```typescript
// ✅ GOOD - Use import type for types
import type { K8sResourceCommon } from '@console/internal/module/k8s';
import { k8sGet } from '@console/internal/module/k8s';
```

---

# TESTING

## Test Types
- **Unit Tests**
  - Framework: Jest 22.x
  - Libraries: @testing-library/react, redux-mock-store

- **End-to-End (E2E) Tests**
  - Tool: Cypress 14.x
  - Specialized test suites for components:
    - Core Console
    - OLM (Operator Lifecycle Manager)
    - Dev Console
    - Shipwright
    - Web Terminal
    - Telemetry
    - Knative
    - Helm
    - Topology
  - Supports headless and interactive modes


## Unit Testing with Jest and React Testing Library
### Testing Best Practices

1. **User-Centric Testing** - Test what users see and interact with. 
   **DO NOT test:**
   - Internal component state
   - Private component methods
   - Props passed to child components
   - CSS class names or styles
   - Component structure (e.g., `expect(container.firstChild).toBe...`)

2. **Accessibility-First** - Queries match how screen readers and users interact with the UI

3. **Semantic Over Generic** - Always prefer role-based queries (e.g., `getByRole`) over generic selectors

4. **DRY Helpers** - Use reusable function in frontend/packages/console-shared/src/test-utils directoty and sub-directory if exists else extract repetitive setup into reusable functions

5. **Async-Aware** - Handle asynchronous updates with `findBy*` and `waitFor`

6. **TypeScript Safety** - Use proper types for props, state, and mock data

7. **Arrange-Act-Assert (AAA) Pattern** - Structure tests logically:
   - **Arrange:** Render component with mocks
   - **Act:** Perform user actions
   - **Assert:** Verify expected state

### Test File Co-location and Naming Convention

**File Structure:**
- Test file must be in `__tests__/` directory within component directory
- Test file must have same name as implementation file
- Use `.spec.tsx` extension
```
MyComponentDirectory/
├── __tests__/
│   └── MyComponent.spec.tsx
└── MyComponent.tsx
```

### Mocking Strategies

When mocking is necessary:
- **ALWAYS** use ES6 `import` statements at the top of the file
- Keep mocks **simple** - return `null`, strings, or `children` directly
- **NEVER** use `require('react')` or `React.createElement()` in mocks
- Use `jest.fn(() => null)` for simple component mocks
- Use `jest.fn(() => 'ComponentName')` for mocks that need to display text
- Use `jest.fn((props) => props.children)` for wrapper components

**Correct Mock Patterns:**
```typescript
// ✅ CORRECT - Return null
jest.mock('../MyComponent', () => () => null);

// ✅ CORRECT - Return string
jest.mock('../LoadingSpinner', () => () => 'Loading...');

// ✅ CORRECT - Return children directly
jest.mock('../Wrapper', () => ({ children }) => children);

// ✅ CORRECT - Use jest.fn for tracking calls
jest.mock('../ButtonBar', () => jest.fn(({ children }) => children));

// ❌ FORBIDDEN - require() anywhere
jest.mock('../Component', () => {
  const React = require('react'); // ❌ NEVER
  return () => React.createElement('div');
});

// ❌ FORBIDDEN - JSX in mocks
jest.mock('../Component', () => () => <div>Mock</div>);
```

**Mock Custom Hooks with jest.fn()**
```typescript
jest.mock('../useCustomHook', () => ({
  useCustomHook: jest.fn(() => [/* mock data */]),
}));
```

**Test user behavior, not implementation**
```typescript
// ❌ BAD - Testing implementation
expect(wrapper.find(DetailsPage).props()).toEqual({...});

// ✅ GOOD - Testing user-visible behavior
expect(screen.getByRole('heading', { name: 'Resource Details' })).toBeVisible();
```

**Clean up mocks** 
```typescript
// ❌ BAD - No cleanup
jest.spyOn(module, 'function');

// ✅ GOOD - Proper cleanup
afterEach(() => {
  jest.restoreAllMocks();
});
```

## End-to-End Testing

Integration/E2E tests validate full user workflows against a real/simulated OpenShift cluster using Cypress + Cucumber (Gherkin BDD). 

- **Focus Areas**: Core Console, OLM, Dev Console, Shipwright, Web Terminal, Telemetry, Knative, Helm, Topology.
- **Key Characteristics**: Gherkin scenarios (.feature files) + step definitions; supports headless/interactive modes; integrates axe-core for a11y.

- **Structure**: Use Gherkin for scenarios (Given/When/Then) in .feature files; implement steps in JS/TS.
- **Selectors**: Prefer `data-test` attributes (e.g., `cy.get('[data-test="create-deployment"]')`) over brittle CSS/ARIA.
- **Async Handling**: Use `cy.wait` sparingly; prefer `cy.intercept` for API mocks + assertions.
- **Mocking**: MSW for API responses; mock external services (e.g., K8s API) to avoid cluster dependency.

### Running E2E Tests (Setup & Commands)
For full prerequisites (cluster login, Cypress install), see [README.md#integration-tests](README.md#integration-tests).

| Mode/Command                  | Purpose                              | Example                            |
|-------------------------------|--------------------------------------|------------------------------------|
| `yarn cypress:run`            | Headless run (all packages)          | -                                  |
| `yarn cypress:run:<pkg>`      | Headless for specific package        | `yarn cypress:run:dev-console`     |
| `yarn cypress:open:<pkg>`     | Interactive UI for debugging         | `yarn cypress:open:console`        |
| `yarn cypress:run:<pkg> --env debug=true` | Verbose/debug mode             | `yarn cypress:run:helm --env debug=true` |
