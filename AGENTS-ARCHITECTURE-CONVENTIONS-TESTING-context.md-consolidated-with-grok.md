# AI Agent Rules and Guidelines

## Usage

All AI assistants reference these files to understand:
- Project architecture and key packages
- Development workflows and commands  
- Code conventions and best practices
- Testing and deployment procedures

## Table of Contents
- [Quick Start](#quick-start)
- [Project Overview](#project-overview)
- [ARCHITECTURE](#architecture)
- [CONVENTIONS](#conventions)
- [TESTING](#testing)
- [Common Pitfalls](#common-pitfalls)
- [Maintenance](#maintenance)

## Quick Start (exact commands)

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

Local auth bypass → see README.md “Local Development”.

## Project Overview
- **Monorepo**: `frontend/` (React + TypeScript, yarn workspaces), `pkg/` & `cmd/` (Go backend)
- **Dynamic plugins**: `frontend/packages/` (dev-console, knative, helm, pipelines, etc.)
- **Stack**: React 18+, TypeScript 5+, PatternFly 5, Redux Toolkit (migrating to hooks), React Query, Cypress + Jest

## ARCHITECTURE

### Core Mental Models
- Everything is **Kubernetes resource-centric**
- Two perspectives: Administrator and Developer
- Data flow: Component → hooks → React Query → Bridge (Go proxy) → OpenShift API
- Never call the Kubernetes API directly from components

### Dynamic Plugin System (required for all new features)

```ts
// GOOD – Dynamic extensions (runtime-loaded)
export const plugin: Plugin = [
  {
    type: 'Page',
    properties: {
      path: '/my-plugin',
      component: { $codeRef: 'MyPage' },
    },
  },
];

// BAD – Static registration (breaks extensibility)
// export const plugin = { extensions: [...] };
```

### Key Extension Types (reference)

| Category       | Types                                                      | Purpose                          |
|----------------|------------------------------------------------------------|----------------------------------|
| Navigation     | NavItem, HrefNavItem, Separator                           | Sidebar / top nav                |
| Pages          | Page, RoutePage, StandaloneRoutePage                       | Full or nested pages             |
| Resources      | ModelDefinition, ResourceListPage, ResourceDetailsPage    | CRUD views                       |
| Actions        | ActionGroup, ResourceActionProvider                        | Kebab / row menus                |
| Dashboards     | DashboardsCard, DashboardsTab                              | Overview health cards            |
| Catalog        | CatalogItemType, CatalogItemProvider                       | Operator / Helm catalog          |
| Perspectives   | Perspective, PerspectiveContext                            | New top-level views              |

## CONVENTIONS

### Modern JavaScript / TypeScript

```ts
// BAD – Old style
const newObj = Object.assign({}, oldObj, { key: 'value' });

// GOOD – Spread operator
const newObj = { ...oldObj, key: 'value' };
```

```ts
// GOOD – Comment complex logic
/**
 * Named 't' to trigger i18n parser — can't use useTranslation() in static context
 */
const t = (key: string) => i18next.t(key);
```

### Performance

```ts
// BAD – Recreates function every render
const handleClick = () => doSomething();

// GOOD – Stable reference
const handleClick = useCallback(() => doSomething(), []);
```

```ts
// GOOD – Lazy load heavy components
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
```

### Type Safety (flag any use of `any`)

```ts
// BAD
const data: any = fetchData();

// GOOD
interface ResourceData { name: string; namespace: string; }
const data: ResourceData = fetchData();
```

```ts
// GOOD – Reuse existing types
interface MyProps {
  appendTo?: React.ComponentProps<typeof Popper>['appendTo'];
}
```

### Imports & Circular Dependencies

```ts
// BAD – Barrel import (causes cycles)
import { Component } from '@console/shared';

// GOOD – Direct import
import { Component } from '@console/shared/src/components/Component';
```

```ts
// GOOD – Type-only import
import type { K8sResourceCommon } from '@console/internal/module/k8s';
```

### Internationalization
Always use the hook:
```ts
const { t } = useTranslation();
return <span>{t('{{count}} pod', { count: pods.length })}</span>;
```

### Styling & Accessibility
- PatternFly components only
- Provide ARIA labels
- Test with axe in Cypress

### Commit Messages
Conventional Commits required:
```
feat(console): add new widget
fix(helm): handle empty releases
chore: update dependencies
```

## TESTING

### Philosophy (React Testing Library — never Enzyme)
Test what the user sees and does — never internals.

```ts
// BAD – Implementation details
expect(wrapper.find(DetailsPage).props()).toHaveProperty('resource');

// GOOD – User-visible
expect(screen.getByRole('heading', { name: 'Resource Details' })).toBeVisible();
```

### File Location (strict)
```
MyComponent/
├── __tests__/
│   └── MyComponent.spec.tsx
└── MyComponent.tsx
```

### Mocking Rules (build will fail if violated)

```ts
// GOOD
jest.mock('../Modal', () => () => null);
jest.mock('../Loading', () => () => 'Loading...');
jest.mock('../Wrapper', () => ({ children }) => children);
jest.mock('../ButtonBar', () => jest.fn(({ children }) => children));

// FORBIDDEN
jest.mock('../Comp', () => () => <div>Mock</div>);           // JSX in mock
jest.mock('../Comp', () => { const React = require('react'); … }); // require()
```

### Async Testing

```ts
const button = await screen.findByRole('button', { name: 'Save' });
fireEvent.click(button);
await waitFor(() => expect(screen.getByText('Saved')).toBeVisible());
```

### Cleanup

```ts
afterEach(() => {
  jest.restoreAllMocks();
});
```

### E2E (Cypress)
- Located in `frontend/packages/integration-tests-cypress`
- Use `data-test` attributes
- Prefer MSW for API mocking

## Common Pitfalls

| Issue                     | Correct Pattern                                  |
|---------------------------|--------------------------------------------------|
| Static plugin registration | Use dynamic extensions (`useMemo` + `$codeRef`) |
| Barrel imports            | Direct file imports only                         |
| Testing internals         | Role / text / data-test queries only             |
| `any` type                | Define interface or use `unknown` + guards       |
| No memoization            | `useCallback` / `useMemo`                        |
| Direct k8s API calls      | Use existing hooks (`useK8sWatchResource`, etc.) |

## Maintenance
- Update this file when conventions change
- Open an issue if anything is outdated
- Last updated: December 2025
