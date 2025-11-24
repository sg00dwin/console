# Code Review Agent Guidelines

> **Generated from analysis of 444 CONSOLE-* feature request PRs (PRs 1-3000) approximately 3 years**
> **Last Updated**: 2025-11-21
> **Total Actionable Patterns Identified**: 63
> **Analysis Period**: Last 3000 merged PRs in openshift/console repository

## Purpose

This document provides AI code review agents (like CodeRabbit) with specific, actionable patterns derived from analyzing 444 merged pull requests in the OpenShift Console repository. These patterns represent real feedback from human reviewers and should be used to provide consistent, high-quality code reviews.

---

## 📊 Analysis Overview

### Data Sources
- **PRs 1-1000**: 235 CONSOLE-* feature requests, 3,203 human comments
- **PRs 1001-2000**: 115 CONSOLE-* feature requests, 1,298 human comments
- **PRs 2001-3000**: 94 CONSOLE-* feature requests, 1,042 human comments
- **Combined**: 444 CONSOLE-* PRs, 5,543 total human review comments

### Pattern Consistency
- **Highly consistent** (appear in multiple sets): 14 core patterns
- **Declining/Resolved** (decreasing over time): 24 patterns
- **Stable** (consistent across periods): 3 patterns
- **Historical** (only in older PRs): 13 legacy patterns

### Historical Trends

The analysis reveals important evolution in review focus:

**Early Period (PRs 1-1000)**: Heavy focus on architectural patterns, new feature development, data fetching patterns, and establishing conventions.

**Middle Period (PRs 1001-2000)**: Shift toward code quality, type safety, accessibility improvements, and refinements.

**Recent Period (PRs 2001-3000)**: Continued emphasis on established patterns with less frequent need for corrections, suggesting better adherence to standards.

---

## 🚨 Critical Review Blockers

These issues MUST be flagged and fixed before merge. These patterns were consistently flagged across analyzed PRs:

### 1. Missing i18n Translation (138 occurrences combined, ~2.5% of reviews)
   - **Consistency**:
     - PRs 1-1000: 68 occurrences
     - PRs 1001-2000: 26 + 15 occurrences (Translation missing + useTranslation hook)
     - PRs 2001-3000: 17 + 11 + 11 occurrences (Wrap strings + i18n + translations)
   - **Trend**: → STABLE - Remains a top priority across all periods
   - **Rule**: All user-facing strings MUST be internationalized using the useTranslation hook
   - **Why**: Console supports multiple languages. Hardcoded strings break localization and are a blocker
   - **How to detect**: String literals in JSX that are user-facing text
   - **Example**:
     ```typescript
     // ❌ BAD - Hardcoded string
     <Button>Delete Resource</Button>

     // ✅ GOOD - Using i18n
     import { useTranslation } from 'react-i18next';
     const { t } = useTranslation();
     <Button>{t('Delete Resource')}</Button>

     // Then run: yarn i18n
     ```

### 2. Use PatternFly Components (98 occurrences, ~1.8% of reviews)
   - **Consistency**:
     - PRs 1-1000: 65 occurrences
     - PRs 1001-2000: 22 occurrences
     - PRs 2001-3000: 11 occurrences
   - **Trend**: ↓ DECLINING - Better adherence to design system over time
   - **Rule**: Use PatternFly components instead of custom implementations
   - **Why**: Console uses PatternFly design system for consistency. Reinventing components creates maintenance burden
   - **How to detect**: Custom button/form/layout implementations when PatternFly equivalents exist
   - **Example**:
     ```typescript
     // ❌ BAD - Custom implementation
     <div className="custom-button" onClick={handleClick}>Click</div>

     // ✅ GOOD - PatternFly component
     import { Button } from '@patternfly/react-core';
     <Button onClick={handleClick}>Click</Button>
     ```

### 3. TypeScript Type Safety (45 occurrences combined)
   - **Consistency**:
     - PRs 1-1000: Type definitions: 17, Type safety: 21, Avoid any: 2
     - PRs 1001-2000: Type definitions: 6, Avoid any: 9
     - PRs 2001-3000: TypeScript types: 11
   - **Trend**: ↑ INCREASING enforcement, especially against 'any' type
   - **Rule**: Define proper interfaces/types; avoid `any` type
   - **Why**: Type safety prevents bugs and improves code maintainability
   - **How to detect**: Usage of `any`, missing type definitions, `@ts-ignore`
   - **Example**:
     ```typescript
     // ❌ BAD - Using any
     const processData = (data: any) => { ... }

     // ✅ GOOD - Proper typing
     interface ResourceData {
       name: string;
       namespace: string;
       labels?: Record<string, string>;
     }
     const processData = (data: ResourceData) => { ... }
     ```

### 4. Add Code Documentation (46 occurrences)
   - **Consistency**:
     - PRs 1-1000: 33 occurrences
     - PRs 1001-2000: 1 occurrence
     - PRs 2001-3000: 12 occurrences
   - **Trend**: ↓ DECREASING overall - Better self-documenting code
   - **Rule**: Complex logic should be documented with comments
   - **Why**: Helps maintainability and onboarding
   - **How to detect**: Complex algorithms, workarounds, or non-obvious logic without comments
   - **Example**:
     ```typescript
     // ✅ GOOD - Documented workaround
     // Workaround for PatternFly Select bug #1234
     // The Select component doesn't properly clear when reset
     // This can be removed when upgrading to PF v6
     const handleClear = () => {
       setSelected(undefined);
       selectRef.current?.clear();
     };
     ```

### 5. Accessibility (ARIA) (22 occurrences combined)
   - **Consistency**:
     - PRs 1-1000: 0 ARIA, 1 keyboard, 5 general a11y
     - PRs 1001-2000: 9 ARIA labels, 5 keyboard
     - PRs 2001-3000: 13 ARIA attributes
   - **Trend**: ↑↑ RAPIDLY INCREASING - Growing focus on accessibility
   - **Rule**: Interactive elements MUST have proper ARIA labels and keyboard support
   - **Why**: Console must be accessible to all users, including those using screen readers
   - **How to detect**: Buttons, links, or interactive elements without aria-label or accessible names
   - **Example**:
     ```typescript
     // ❌ BAD - No aria-label for icon button
     <Button variant="plain"><TrashIcon /></Button>

     // ✅ GOOD - Proper aria-label
     <Button variant="plain" aria-label="Delete resource">
       <TrashIcon />
     </Button>

     // ✅ GOOD - Keyboard accessible
     <div
       role="button"
       tabIndex={0}
       onClick={handleClick}
       onKeyDown={(e) => e.key === 'Enter' && handleClick()}
     >
       Custom button
     </div>
     ```

### 6. Code Quality and Linting (244 occurrences combined)
   - **Consistency**:
     - PRs 1-1000: 205 naming conventions
     - PRs 1001-2000: 11 naming conventions
     - PRs 2001-3000: 22 linting issues, 17 cleanup
   - **Trend**: → EVOLVING - From naming to automated linting
   - **Rule**: Follow ESLint rules and maintain code quality standards
   - **Why**: Consistent code quality improves maintainability
   - **How to detect**: ESLint warnings, inconsistent naming, code smells

---

## 📋 Review Patterns by Category

For each category below, patterns are ranked by combined frequency across all 3000 PRs analyzed.

### Category: UI/UX (1,117+ occurrences, ~20% of categorized feedback)
**Trend**: ↓ Decreasing - Better adherence to design system over time

**Historical Context**: This was the top category in early PRs, reflecting the establishment of PatternFly standards. The decline suggests teams have internalized these patterns.

#### 1. Use PatternFly components (98 occurrences, 1.8%)
- **Frequency by Period**:
  - PRs 1-1000: 65
  - PRs 1001-2000: 22
  - PRs 2001-3000: 11
- **Trend**: ↓ DECLINING - Teams are now consistently using PatternFly
- **Historical Context**: Major focus in early period; less correction needed now
- **Rule**: Use existing PatternFly components from `@patternfly/react-core`
- **Context**: Core console design principle
- **Example**:
  ```typescript
  // Use PatternFly components instead of custom
  import { Card, CardBody, CardTitle } from '@patternfly/react-core';
  <Card>
    <CardTitle>Title</CardTitle>
    <CardBody>Content</CardBody>
  </Card>
  ```

#### 2. Style and Layout Updates (10 occurrences in recent PRs)
- **Trend**: 🆕 EMERGING in PRs 2001-3000
- **Rule**: Follow PatternFly spacing, layout, and style guidelines


### Category: Testing (1,030+ occurrences, ~19% of categorized feedback)
**Trend**: ↓ Decreasing frequency but stable importance

**Historical Context**: High in early period (PRs 1-1000) during major feature development. Lower in later periods suggests better test coverage practices.

#### 1. Add tests for functionality (73 combined occurrences)
- **Frequency by Period**:
  - PRs 1-1000: 56 (missing unit tests)
  - PRs 1001-2000: 0
  - PRs 2001-3000: 17 (add tests + e2e + integration)
- **Trend**: → STABLE - Consistently important
- **Rule**: New features require appropriate test coverage
- **Example**:
  ```typescript
  // Add unit tests for new components
  describe('MyComponent', () => {
    it('renders correctly', () => {
      const { getByText } = render(<MyComponent />);
      expect(getByText('Expected Text')).toBeInTheDocument();
    });
  });
  ```

#### 2. Use mocks in tests (6 occurrences in recent PRs)
- **Trend**: 🆕 Emerging pattern
- **Rule**: Mock external dependencies appropriately


### Category: i18n (138+ occurrences, ~2.5% of categorized feedback)
**Trend**: → STABLE - Consistently critical across all periods

**Historical Context**: This remains one of the most consistent patterns across all three time periods, showing it's a fundamental requirement.

#### 1. Translation missing / Use i18n (138 combined occurrences)
- **Frequency by Period**:
  - PRs 1-1000: 68 (translation missing) + 29 (useTranslation hook)
  - PRs 1001-2000: 26 (translation missing) + 15 (useTranslation hook)
  - PRs 2001-3000: 17 (wrap strings) + 11 (use i18n) + 11 (add translations)
- **Trend**: → STABLE - Consistent priority across all periods
- **Historical Context**: This is an evergreen pattern - consistently enforced over 3000 PRs
- **Rule**: All user-facing strings must use the useTranslation hook
- **Context**: Critical for internationalization support
- **Example**:
  ```typescript
  import { useTranslation } from 'react-i18next';

  const MyComponent = () => {
    const { t } = useTranslation();
    return <h1>{t('Welcome to Console')}</h1>;
  };

  // After adding translations, run: yarn i18n
  ```


### Category: TypeScript (262+ occurrences, ~5% of categorized feedback)
**Trend**: ↑ INCREASING - Stronger emphasis on type safety

**Historical Context**: Type safety enforcement has grown significantly, especially the push to avoid `any` type.

#### 1. Add type definitions (23 occurrences)
- **Frequency by Period**:
  - PRs 1-1000: 17
  - PRs 1001-2000: 6
  - PRs 2001-3000: 0 (replaced by more specific patterns)
- **Trend**: → EVOLVING
- **Rule**: Define proper interfaces/types for props, state, and data structures

#### 2. Avoid any type (11 occurrences)
- **Frequency by Period**:
  - PRs 1-1000: 2
  - PRs 1001-2000: 9
  - PRs 2001-3000: 0 (likely absorbed into general TypeScript patterns)
- **Trend**: ↑ INCREASED in middle period (+350%)
- **Historical Context**: This became a major focus area in PRs 1001-2000
- **Rule**: Use proper types instead of `any`

#### 3. Use proper TypeScript types (11 occurrences in recent PRs)
- **Trend**: 🆕 Continuing the type safety emphasis
- **Rule**: Ensure all variables, parameters, and returns have proper types


### Category: Accessibility (67+ occurrences, ~1.3% of categorized feedback)
**Trend**: ↑↑ RAPIDLY INCREASING - Growing focus on a11y

**Historical Context**: Minimal in early PRs (PRs 1-1000), but became a major focus starting in PRs 1001-2000 and continuing through PRs 2001-3000.

#### 1. Add ARIA attributes (22 combined occurrences)
- **Frequency by Period**:
  - PRs 1-1000: 0
  - PRs 1001-2000: 9 (add aria-label)
  - PRs 2001-3000: 13 (ARIA attributes)
- **Trend**: ↑↑ RAPIDLY INCREASING - New standard emerging
- **Historical Context**: Started appearing in PRs 1001-2000, now a consistent requirement
- **Rule**: Interactive elements need accessible names
- **Example**:
  ```typescript
  <Button variant="plain" aria-label="Delete resource">
    <TrashIcon />
  </Button>
  ```

#### 2. Keyboard navigation (6 occurrences)
- **Frequency by Period**:
  - PRs 1-1000: 1
  - PRs 1001-2000: 5
  - PRs 2001-3000: 0
- **Trend**: ↑ INCREASED in middle period
- **Rule**: Ensure keyboard accessibility for interactive elements


### Category: Code Quality (73+ occurrences, ~1.3% of categorized feedback)
**Trend**: → EVOLVING - From manual to automated

**Historical Context**: Shifted from manual naming convention reviews to automated linting enforcement.

#### 1. Naming conventions (216 occurrences)
- **Frequency by Period**:
  - PRs 1-1000: 205
  - PRs 1001-2000: 11
  - PRs 2001-3000: 0
- **Trend**: ↓↓ RESOLVED - Better practices adopted
- **Historical Context**: Major focus in early period; teams now follow conventions consistently
- **Rule**: Use clear, descriptive names for variables, functions, components

#### 2. Fix ESLint warnings (6 occurrences)
- **Frequency by Period**:
  - PRs 1-1000: 0
  - PRs 1001-2000: 6
  - PRs 2001-3000: 0 (merged into linting issues pattern)
- **Trend**: 🆕 NEW automated enforcement
- **Rule**: Address ESLint warnings before merging

#### 3. Fix linting issues (22 occurrences in recent PRs)
- **Trend**: 🆕 Continuing automated quality checks
- **Rule**: Ensure code passes all linting rules

#### 4. Code duplication (19 occurrences)
- **Frequency by Period**:
  - PRs 1-1000: 11
  - PRs 1001-2000: 8
  - PRs 2001-3000: 0
- **Trend**: ↓ DECLINING
- **Rule**: Extract duplicated code into shared utilities or components


### Category: React Patterns (338+ occurrences, ~6% of categorized feedback)
**Trend**: ↑ INCREASING - More attention to React best practices

#### 1. Use useCallback/useMemo (22 occurrences)
- **Frequency by Period**:
  - PRs 1-1000: 20
  - PRs 1001-2000: 2
  - PRs 2001-3000: 0
- **Trend**: ↓ DECLINING - Better understood
- **Rule**: Memoize expensive calculations and callbacks
- **Example**:
  ```typescript
  const memoizedValue = useMemo(() => expensiveCalculation(data), [data]);
  const memoizedCallback = useCallback(() => handleClick(), [dependency]);
  ```

#### 2. Add proper key props to lists (6 occurrences)
- **Frequency by Period**:
  - PRs 1-1000: 0
  - PRs 1001-2000: 6
  - PRs 2001-3000: 0
- **Trend**: → STABLE
- **Rule**: List items must have unique, stable keys

#### 3. Define component props (9 occurrences in recent PRs)
- **Trend**: 🆕 EMERGING
- **Rule**: Properly type component props with interfaces


### Category: Error Handling (227+ occurrences, ~4% of categorized feedback)
**Trend**: ↑ INCREASING emphasis on robustness

#### 1. Handle API errors properly (11 occurrences)
- **Frequency by Period**:
  - PRs 1-1000: 3
  - PRs 1001-2000: 8
  - PRs 2001-3000: 0
- **Trend**: ↑ INCREASED +167% in middle period
- **Historical Context**: Became a focus area in PRs 1001-2000
- **Rule**: API calls must handle errors gracefully
- **Example**:
  ```typescript
  try {
    const data = await fetchResource();
    setResource(data);
  } catch (error) {
    setError(error.message);
    console.error('Failed to fetch resource:', error);
  }
  ```


### Category: Performance (79+ occurrences, ~1.4% of categorized feedback)
**Trend**: ↓ DECREASING - Better performance awareness

#### 1. Optimize for performance (7 occurrences)
- **Frequency by Period**:
  - PRs 1-1000: 2
  - PRs 1001-2000: 5
  - PRs 2001-3000: 0
- **Trend**: ↑ INCREASED then stabilized
- **Rule**: Optimize expensive operations


### Category: Dependencies (244+ occurrences)
**Trend**: ↑ INCREASING attention to dependency management


### Category: API/Data (466+ occurrences)
**Trend**: ↓ DECREASING - More standardized patterns

**Historical Context**: Very high in early period due to data fetching pattern establishment (235 occurrences in PRs 1-1000).


### Category: Security (36+ occurrences)
**Trend**: ↑ INCREASING security awareness


### Category: Code Architecture (106+ occurrences)
**Trend**: ↑ INCREASING focus on organization


### Category: Git/PR Process (209+ occurrences)
**Trend**: → STABLE process feedback


### Category: Documentation (818+ occurrences)
**Trend**: ↓ DECREASING - Better self-documenting code


---

## 🎯 Console-Specific Patterns

Unique patterns for the OpenShift Console codebase:

### 1. PatternFly Component Usage (98 occurrences across all periods)
- **Historical Evolution**:
  - PRs 1-1000: 65 occurrences (establishing standards)
  - PRs 1001-2000: 22 occurrences (refinement)
  - PRs 2001-3000: 11 occurrences (maintenance)
- **Trend**: ↓ DECLINING - Better adherence
- **Rule**: Always use PatternFly components from `@patternfly/react-core`
- **Why**: Ensures design consistency and reduces maintenance

### 2. i18n Compliance (138 occurrences across all periods)
- **Historical Evolution**: Consistently enforced across all three periods
- **Trend**: → STABLE - Evergreen requirement
- **Rule**: All user-facing strings must be internationalized
- **Why**: Console is used globally in multiple languages

### 3. Dynamic Plugin Pattern (66 occurrences, legacy)
- **Historical Context**: Only appeared in PRs 1-1000
- **Status**: 🏛️ LEGACY - Pattern now well-established
- **Why disappeared**: Teams understand the plugin architecture

### 4. RTL (React Testing Library) Migration (18 occurrences, legacy)
- **Historical Context**: Migration project completed
- **Status**: 🏛️ LEGACY - Migration completed

---

## 📈 Historical Trend Analysis

### 🔥 Key Emerging Patterns

Patterns showing strong growth or new appearance:

1. **ARIA Attributes & Accessibility** (0 → 9 → 13)
   - Emerged in PRs 1001-2000, continued growth in 2001-3000
   - Why emerging: Increasing focus on accessibility standards
   - **Action**: Prioritize accessibility in all reviews

2. **Automated Linting Enforcement** (0 → 6 → 22)
   - New pattern starting in PRs 1001-2000
   - Why emerging: Shift from manual code quality checks to automated tools
   - **Action**: Ensure code passes all linting rules

3. **TypeScript Type Safety** (21+2 → 6+9 → 11)
   - Consistent focus with evolution in enforcement
   - Why emerging: Stronger type safety culture
   - **Action**: Actively prevent `any` type usage

### 📉 Successfully Resolved Patterns

Patterns that declined significantly (likely addressed systematically):

1. **Naming Conventions** (205 → 11 → 0)
   - **Overall trend**: -100% (completely resolved)
   - **Why declining**: Teams have internalized naming standards
   - **Success factor**: Likely combination of linting rules and team education

2. **Use useTranslation Hook** (29 → 15 → 0 as separate pattern)
   - **Note**: Merged into general i18n patterns in recent period
   - **Why declining**: Pattern absorbed into general i18n enforcement
   - **Success factor**: Well-understood requirement

3. **Code Comments/Documentation** (33 → 1 → 12)
   - **Overall trend**: -64% decrease
   - **Why declining**: More self-documenting code practices
   - **Success factor**: Better code structure and naming

4. **Dynamic Plugin Pattern** (66 → 0 → 0)
   - **Overall trend**: Disappeared after initial period
   - **Why declining**: Architecture well-established and documented
   - **Success factor**: Successful pattern establishment and adoption

5. **Import Organization** (49 → 0 → 0)
   - **Why declining**: Likely automated through prettier/ESLint
   - **Success factor**: Tooling automation

6. **Data Fetching Patterns** (235 → 0 → 0)
   - **Why declining**: Standardized data fetching approaches established
   - **Success factor**: Established patterns and utilities

### ➡️ Stable/Evergreen Patterns

Patterns that remain consistently important:

1. **i18n/Translation** (~40-50 occurrences per period)
   - Consistent priority across all time periods
   - Appears in different forms but same core requirement
   - **Why stable**: Fundamental requirement for global product

2. **PatternFly Usage** (65 → 22 → 11)
   - Declining but still present
   - **Why important**: Core design system compliance

3. **Type Safety** (variable forms across periods)
   - Consistent focus with evolving enforcement
   - **Why stable**: Fundamental to code quality

### 🆕 Patterns Unique to Recent Period (PRs 2001-3000)

These patterns appeared only in the most recent analysis:

1. **Clean up code** (17 occurrences)
2. **Be consistent** (10 occurrences)
3. **Define component props** (9 occurrences)

**Note**: These may represent different pattern extraction methodology rather than truly new requirements.

### 🏛️ Historical/Legacy Patterns

Patterns that appeared in early PRs but are no longer common:

1. **RTL Migration Required** (18 in Set 1) - Migration completed
2. **ConsoleDataView Usage** (29 in Set 1) - Pattern established
3. **Dynamic Plugin Pattern** (66 in Set 1) - Architecture established
4. **Missing Unit Tests** (56 in Set 1) - Better test coverage habits
5. **Organize Imports** (49 in Set 1) - Automated via tooling
6. **Run yarn i18n** (39 in Set 1) - Part of standard workflow

---

## 📊 Pattern Statistics

### Top 30 Most Common Patterns (Combined PRs 1-3000)

1. **Data fetching** - 235 occurrences (4.2%)
   - PRs 1-1000: 235, PRs 1001-2000: 0, PRs 2001-3000: 0
   - Trend: 🏛️ LEGACY - Pattern established in early period

2. **Naming conventions** - 216 occurrences (3.9%)
   - PRs 1-1000: 205, PRs 1001-2000: 11, PRs 2001-3000: 0
   - Trend: ↓↓ RESOLVED

3. **i18n/Translation** - 138 occurrences combined (2.5%)
   - Consistently enforced across all periods in various forms
   - Trend: → STABLE

4. **Use PatternFly components** - 98 occurrences (1.8%)
   - PRs 1-1000: 65, PRs 1001-2000: 22, PRs 2001-3000: 11
   - Trend: ↓ DECLINING

5. **Dynamic plugin pattern** - 66 occurrences (1.2%)
   - PRs 1-1000: 66, PRs 1001-2000: 0, PRs 2001-3000: 0
   - Trend: 🏛️ LEGACY

6. **Testing** - 73 occurrences combined (1.3%)
   - PRs 1-1000: 56, PRs 1001-2000: 0, PRs 2001-3000: 17
   - Trend: → STABLE

7. **Organize imports** - 49 occurrences (0.9%)
   - PRs 1-1000: 49, PRs 1001-2000: 0, PRs 2001-3000: 0
   - Trend: 🏛️ LEGACY - Automated

8. **Documentation/Comments** - 46 occurrences (0.8%)
   - PRs 1-1000: 33, PRs 1001-2000: 1, PRs 2001-3000: 12
   - Trend: ↓ DECLINING

9. **TypeScript Type Safety** - 45 occurrences combined (0.8%)
   - Present across all periods with increasing enforcement
   - Trend: ↑ INCREASING

10. **Run yarn i18n** - 39 occurrences (0.7%)
   - PRs 1-1000: 39, PRs 1001-2000: 0, PRs 2001-3000: 0
   - Trend: 🏛️ LEGACY - Part of workflow

11. **Use ConsoleDataView** - 29 occurrences (0.5%)
   - PRs 1-1000: 29, PRs 1001-2000: 0, PRs 2001-3000: 0
   - Trend: 🏛️ LEGACY

12. **Add follow-up story** - 25 occurrences (0.5%)
   - PRs 1-1000: 25, PRs 1001-2000: 0, PRs 2001-3000: 0
   - Trend: 🏛️ LEGACY

13. **Fix linting issues** - 22 occurrences (0.4%)
   - PRs 1-1000: 0, PRs 1001-2000: 0, PRs 2001-3000: 22
   - Trend: 🆕 NEW - Automated enforcement

14. **ARIA Attributes** - 22 occurrences (0.4%)
   - PRs 1-1000: 0, PRs 1001-2000: 9, PRs 2001-3000: 13
   - Trend: ↑↑ RAPIDLY INCREASING

15. **Use useMemo/useCallback** - 22 occurrences (0.4%)
   - PRs 1-1000: 20, PRs 1001-2000: 2, PRs 2001-3000: 0
   - Trend: ↓ DECLINING - Well understood

16. **Code duplication** - 19 occurrences (0.3%)
   - PRs 1-1000: 11, PRs 1001-2000: 8, PRs 2001-3000: 0
   - Trend: ↓ DECLINING

17. **RTL migration required** - 18 occurrences (0.3%)
   - PRs 1-1000: 18, PRs 1001-2000: 0, PRs 2001-3000: 0
   - Trend: 🏛️ LEGACY - Migration completed

18. **API error handling** - 11 occurrences (0.2%)
   - PRs 1-1000: 3, PRs 1001-2000: 8, PRs 2001-3000: 0
   - Trend: ↑ then stabilized

19. **Empty state needed** - 8 occurrences (0.1%)
   - PRs 1-1000: 5, PRs 1001-2000: 3, PRs 2001-3000: 0
   - Trend: ↓ DECLINING

20. **Performance optimization** - 7 occurrences (0.1%)
   - PRs 1-1000: 2, PRs 1001-2000: 5, PRs 2001-3000: 0
   - Trend: ↑ then stabilized

21. **Keyboard navigation** - 6 occurrences (0.1%)
   - PRs 1-1000: 1, PRs 1001-2000: 5, PRs 2001-3000: 0
   - Trend: ↑ INCREASED

22. **Add proper key props** - 6 occurrences (0.1%)
   - PRs 1-1000: 0, PRs 1001-2000: 6, PRs 2001-3000: 0
   - Trend: → STABLE

23. **Fix ESLint warnings** - 6 occurrences (0.1%)
   - PRs 1-1000: 0, PRs 1001-2000: 6, PRs 2001-3000: 0
   - Trend: → NEW then absorbed into linting

24-30. Various lower-frequency patterns (<5 occurrences each)


### Category Distribution (Combined)

| Category | PRs 1-1000 | PRs 1001-2000 | PRs 2001-3000 | Total | Trend |
|----------|------------|---------------|---------------|-------|-------|
| UI/UX | High | Medium | Low | 1117+ | ↓ DECLINING |
| Testing | High | Medium | Medium | 1030+ | ↓ then → STABLE |
| Documentation | High | Low | Low | 818+ | ↓ DECLINING |
| API/Data | Medium | Low | Low | 466+ | ↓ DECLINING |
| React Patterns | Medium | High | Medium | 338+ | ↑ INCREASING |
| TypeScript | Medium | High | Medium | 262+ | ↑ INCREASING |
| Dependencies | Low | Medium | Medium | 244+ | ↑ INCREASING |
| Error Handling | Low | Medium | Low | 227+ | ↑ then → STABLE |
| Git/PR Process | Medium | Low | Medium | 209+ | → STABLE |
| Code Architecture | Low | Medium | Low | 106+ | → MODERATE |
| i18n | Medium | Medium | Medium | 92+ | → STABLE |
| Performance | Low | Low | Low | 79+ | → STABLE |
| Code Quality | High | Low | Low | 73+ | ↓ then AUTOMATED |
| Accessibility | Very Low | Medium | Medium | 67+ | ↑↑ RAPIDLY INCREASING |
| Security | Very Low | Low | Very Low | 36+ | → LOW BUT IMPORTANT |

---

## 🤖 Usage Guidelines for AI Agents

### Priority Scoring (Data-Driven)

When reviewing code, assign priority scores based on combined frequency, consistency, trend, and historical context:

- **P0 (Critical)**: Must fix before merge
  - Patterns with >50 occurrences across all periods AND consistent/increasing
  - OR patterns identified as security/accessibility/i18n violations
  - **Specific patterns:**
    - Missing i18n translation (138 total, consistently ~2.5% of all reviews)
    - Use PatternFly components (98 total, declining but still important)
    - TypeScript type safety (45 total, increasing enforcement)
    - ARIA/Accessibility (22 total, rapidly increasing +1000%+)
    - Critical linting issues (22 in recent period)

- **P1 (High)**: Should fix before merge
  - Patterns with 15-50 occurrences OR strong upward trend (>100% increase)
  - **Specific patterns:**
    - API error handling (11 occurrences, +167% increase in middle period)
    - Code duplication (19 occurrences, was increasing)
    - Add proper key props to lists (6 occurrences, new standard)
    - Performance optimization (7 occurrences, periodic importance)
    - Testing coverage (73 combined, stable importance)

- **P2 (Medium)**: Good to fix, can defer
  - Patterns with 5-15 occurrences
  - **Specific patterns:**
    - Add empty states (8 occurrences)
    - Component props definition (9 recent occurrences)
    - Code cleanup (17 recent occurrences)

- **P3 (Low)**: Nice to have, optional
  - Patterns with <5 occurrences OR declining/resolved trends
  - **Note**: Many patterns from early period are now P3 due to successful resolution

### Review Workflow

1. **Check P0 critical blockers first**
   - i18n compliance (highest consistency - 138 occurrences across 3000 PRs)
   - PatternFly component usage (98 occurrences, core standard)
   - TypeScript type safety (45 occurrences, increasing)
   - Accessibility (22 occurrences, rapidly emerging priority)
   - Linting compliance (22 recent occurrences)

2. **Review P1 high priority items**
   - Error handling (especially API errors)
   - Testing coverage
   - React best practices (keys, props)
   - Code duplication

3. **Provide P2 medium priority suggestions**
   - Empty states and edge cases
   - Component props typing
   - Code cleanup and consistency

4. **Optionally mention P3 low priority improvements**
   - Minor optimizations
   - Future enhancements
   - **Note**: Skip patterns that have been successfully resolved (naming conventions, import organization, etc.)

5. **Reference trends and historical context**
   - When a pattern is rapidly emerging, emphasize its growing importance
   - When seeing good adherence to resolved patterns, acknowledge it
   - Focus on current priorities rather than historical ones

### Comment Style

- **Be specific and actionable**: Reference actual patterns from this analysis
- **Provide code examples when possible**: Show the recommended implementation
- **Link to relevant documentation**: PatternFly docs, Console patterns, etc.
- **Explain WHY, not just WHAT**: Help developers understand the reasoning
- **Be constructive and helpful**: Focus on improvement, not criticism
- **Reference historical data when relevant**:
  - "This is a consistent priority (appears in X% of all PRs reviewed)"
  - "This is an emerging pattern (increased Y% in recent PRs)"
  - "Great adherence to [pattern] - this was a major focus in earlier PRs"

### Confidence Levels

Use pattern consistency and historical trends to determine comment confidence:

- **Very High confidence**: Pattern appeared consistently across all three periods (e.g., i18n, PatternFly)
  - These are core, non-negotiable standards

- **High confidence**: Pattern appeared in multiple periods with increasing trend (e.g., accessibility, type safety)
  - Emerging standards that should be enforced

- **Medium confidence**: Pattern appeared in 1-2 periods with varying frequency
  - Context-dependent enforcement

- **Low confidence**: Pattern appeared in only one period or very few times
  - Suggest but don't require

- **Historical/Legacy**: Pattern common in early periods but resolved
  - **Don't flag these unless genuinely needed** - teams have likely internalized these

### Adapting to Historical Evolution

**For emerging patterns** (accessibility, linting):
- Emphasize importance and explain the trend
- "This is an increasingly important requirement (grew X% in recent reviews)"

**For declining/resolved patterns** (naming, imports, data fetching):
- **Reduce or skip comments on these** - they've been successfully addressed
- Only flag if there's a genuine violation
- Acknowledge good practices: "Good use of established data fetching patterns"

**For stable patterns** (i18n, PatternFly, testing):
- These are core, established requirements - enforce consistently
- "This is a core requirement (consistently flagged across 3000+ PRs)"

**For legacy patterns** (dynamic plugins, RTL migration, ConsoleDataView):
- **Don't mention these unless directly relevant**
- These were one-time migrations or established patterns

### Example Comments

**Very High Confidence (Evergreen Pattern):**
```markdown
**P0: Missing i18n translation**

User-facing text should use the `useTranslation` hook for internationalization. This is one of the most consistent review requirements (138 occurrences across 3000 PRs analyzed, ~2.5% of all reviews):

\```typescript
// ❌ Current
<Button>Delete Resource</Button>

// ✅ Suggested
const { t } = useTranslation();
<Button>{t('Delete Resource')}</Button>
\```

After adding translations, run `yarn i18n` to update locale files.
```

**Emerging Pattern (Rapidly Growing):**
```markdown
**P0: Missing ARIA attributes**

Accessibility is a rapidly growing priority (0 occurrences in early PRs → 13 in recent PRs). Please add ARIA labels to this interactive element:

\```typescript
// ✅ Add aria-label
<Button variant="plain" aria-label="Delete resource">
  <TrashIcon />
</Button>
\```
```

**Acknowledging Good Practice:**
```markdown
**✅ Good adherence to PatternFly design system**

Nice use of PatternFly components throughout. This was a major focus in earlier PRs (98 total occurrences), and you've applied it consistently here.
```

**Legacy Pattern (Skip unless violated):**
```markdown
// ❌ DON'T comment on naming conventions unless truly problematic
// This was heavily reviewed in early PRs (205 occurrences in PRs 1-1000)
// but has been successfully resolved (0 occurrences in recent PRs)

// ✅ Only comment if there's a genuine issue:
**P2: Consider more descriptive naming**

While naming conventions are now well-established in the codebase, this variable name could be clearer: `data` → `userData` for better context.
```

---

## 📚 Additional Resources

- [PatternFly Documentation](https://www.patternfly.org/)
- [React Testing Library](https://testing-library.com/react)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [Console Contributing Guide](https://github.com/openshift/console/blob/master/CONTRIBUTING.md)
- [React i18next Documentation](https://react.i18next.com/)

---

## 📈 Analysis Metadata

### Combined Analysis (PRs 1-3000)
- **Total PRs Analyzed**: 444 CONSOLE-* feature requests (from 3000 total merged PRs)
- **Time Period**:
  - PRs 1-1000: Unknown (oldest)
  - PRs 1001-2000: Unknown (middle)
  - PRs 2001-3000: 2022-11-01 to 2024-01-16 (most recent)
- **Total Human Comments**: 5,543
- **Total Actionable Patterns**: 63 unique patterns
- **Unique Pattern Types**: 63

### Breakdown by Period

**PRs 1-1000** (Oldest Period)
- CONSOLE-* PRs: 235
- Human Comments: 3,203
- Patterns: 27 unique
- Focus: Establishing architectural patterns, design system adoption, testing standards

**PRs 1001-2000** (Middle Period)
- CONSOLE-* PRs: 115
- Human Comments: 1,298
- Patterns: 17 unique
- Focus: Refinement, type safety, accessibility emergence, error handling

**PRs 2001-3000** (Most Recent)
- CONSOLE-* PRs: 94
- Human Comments: 1,042
- Patterns: 34 unique (different extraction methodology)
- Date Range: 2022-11-01 to 2024-01-16
- Focus: Continued standards enforcement, linting automation, accessibility

### Filtering
- **Bot Comments Filtered**: coderabbitai, openshift-ci-robot, openshift-merge-robot, openshift-bot, openshift-cherrypick-robot, codecov, jira-bot, etc.
- **Ignored Comment Types**: /lgtm, /test, /retest, /hold, /approve, /assign, label requirements, generic approvals, bot acknowledgments
- **Consistency Threshold**: Patterns appearing across multiple time periods given higher priority
- **Trend Analysis**: Patterns tracked across three distinct periods for historical evolution

### Key Insights from 3000 PR Analysis

1. **i18n remains evergreen priority** - Consistently ~2.5% of all reviews across all periods (138 total occurrences)

2. **Accessibility is THE emerging trend** - Grew from 0 in early PRs to 22 in recent periods (+∞% increase)

3. **Type safety enforcement evolved** - From general type issues to specific "avoid any" enforcement (45 total occurrences)

4. **Automation replaced manual checks** - Naming conventions (205→11→0) replaced by linting (0→6→22)

5. **Many patterns successfully resolved**:
   - Data fetching patterns: Standardized (235→0→0)
   - Import organization: Automated (49→0→0)
   - Dynamic plugins: Architecture established (66→0→0)
   - RTL migration: Completed (18→0→0)
   - Naming conventions: Internalized (205→11→0)

6. **Documentation evolved** - From explicit comments (33→1→12) to self-documenting code

7. **PatternFly adoption successful** - Declined from 65 to 11 occurrences (better adherence)

8. **Testing remains important** - Stable around 1% of reviews, evolved from "missing tests" to "appropriate test types"

9. **Error handling grew then stabilized** - Became focus in middle period (+167%), then integrated into practices

10. **Quality evolved from manual to automated** - Manual code quality reviews replaced by linting and tooling

---

## 🔄 Maintenance

This document should be regenerated quarterly or after significant codebase changes to capture evolving patterns.

### Trend Monitoring

Review trends quarterly to:
- Identify newly emerging patterns that may need automation or documentation
- Confirm declining patterns are truly resolved (not reappearing)
- Update priority scoring based on current data
- Adjust AI agent configuration for maximum relevance
- Celebrate successful pattern resolution (e.g., naming conventions, migrations)

### How to Regenerate

```bash
# Analyze latest PRs and update AGENTS.md
# Use the same methodology:
# 1. Fetch last N merged PRs
# 2. Filter for CONSOLE-* feature requests
# 3. Extract and categorize human review comments
# 4. Compare with previous analysis
# 5. Update this document with trends and historical context
```

**Last regenerated**: 2025-11-21
**Analysis includes**: PRs 1-3000 (comprehensive three-period analysis)
**Next recommended update**: 2026-02-21 (quarterly)

---

**Note**: This document is based on statistical analysis of 5,543 human review comments across 444 CONSOLE-* feature request PRs spanning 3000 merged pull requests. The patterns, priorities, and trends reflect what maintainers consistently care about and how those priorities have evolved over time. Use this as a guide to provide reviews that align with current project standards and expectations, while understanding the historical context of how these standards were established.

**Key Principle**: Focus on current priorities (P0/P1) and emerging trends. Many early patterns have been successfully resolved through automation, documentation, and team education - acknowledge this success rather than over-reviewing resolved issues.
