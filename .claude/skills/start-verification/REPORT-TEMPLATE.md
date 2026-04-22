---
pr: <PR-number>
issue: <ISSUE-KEY>
title: <Issue Title from Jira>
branch: verify/<issue-type>-<number>-<Short-Title>
pr-author: <PR Author>
created: YYYY-MM-DD
last-updated: YYYY-MM-DD
---

# Verification: <ISSUE-KEY> -- <Issue Title>

## Verification Status
**Overall Status:** [Not Started | In Progress | Blocked | Pass | Fail]
**Current Phase:** Phase X -- Phase Name
**Started:** YYYY-MM-DD
**Last Activity:** YYYY-MM-DD

### Progress Ledger
Use markers to track phase completion at a glance: ✅ Complete | ✅🔍 Complete (code analysis only) | 🚧 In Progress | ⚠️ Issue Found | ⬜ Not Started

Use ✅🔍 when a phase completed via code analysis without runtime verification (no cluster, no browser, no human testing). This is honest about what level of verification occurred -- it's not a failure, but it's not the same as ✅ backed by runtime evidence.

- ⬜ Phase 0: Change Analysis
- ⬜ Phase 1: Test Assessment
- ⬜ Phase 2: Automated Quality Gates
- ⬜ Phase 3: Functional Verification
- ⬜ Phase 4: Regression Assessment
- ⬜ Phase 5: Final Verdict

## Quick Links
- **PR:** https://github.com/openshift/console/pull/<PR-number>
- **Jira:** https://issues.redhat.com/browse/<ISSUE-KEY>
- **Verification Branch:** `verify/<issue-type>-<number>-<Short-Title>`

---

## Verification Checklist

Built from acceptance criteria and PR description. Each item must have a verdict before the final phase.

| # | Criterion | Verdict | Method | Evidence |
|---|-----------|---------|--------|----------|
| 1 | ... | [Pass / Fail / Blocked / N/A] | [Test / Code trace / Manual / DevTools] | ... |
| 2 | ... | [Pass / Fail / Blocked / N/A] | [Test / Code trace / Manual / DevTools] | ... |

**Method key:** A "Test" pass is backed by a deterministic, repeatable assertion. A "Code trace" pass is based on reading and reasoning about the code -- higher confidence than no verification, but not equivalent to a test. A "Manual" pass is confirmed by a human in a browser. A "DevTools" pass is confirmed via browser developer tools (Network tab, profiler, console).

---

## Information Gaps

Assessed during setup. Gaps identified here affect verification confidence and are carried into the final verdict.

| Gap | Severity | Impact on Verification | Status |
|-----|----------|----------------------|--------|
| ... | [Blocks / Reduces confidence / Nice to have] | ... | [Open / Resolved / Proceeded without] |

**Questions for Reporter/Author:**
-

**Confidence Impact:** [No gaps | Minor gaps -- proceed with caveats | Major gaps -- reduced confidence | Blocking gaps -- paused]

---

## Mission Briefing

**You are verifying, not implementing.** Your job is to determine whether this PR is safe to merge. Be thorough and skeptical. Document every finding with evidence.

**PR Details:**
- **Title:** ...
- **Author:** ...
- **Files Changed:** (count)
- **Additions/Deletions:** +X / -Y

**Author's Test Plan:** (extracted from PR description -- "Test plan", "Tests", "Test Validation" sections)
- ...
- (If none provided, note this as an information gap)

**Jira Details:**
- **Summary:** ...
- **Description:** (condensed key points)
- **Acceptance Criteria:** ...
- **Related Links / Attachments:** ...

---

## Phase 0: Change Analysis (Read-Only)

**Status:** [Completed | In Progress | Not Started]
**Last Updated:** YYYY-MM-DD

**Directive:** Understand what the PR changes and why, before running anything. Build a mental model of the change's scope, intent, and risk profile.

You **must** execute the following steps in order:

1. **Read Every Changed File**
   - Read the full diff: `gh pr diff <pr-number>`
   - For each changed file, read the full file (not just the diff) to understand context.
   - Categorize changes: new code, modified code, deleted code, test changes, config changes, i18n changes.

2. **Understand the Intent**
   - Does the diff match what the Jira issue describes?
   - Are there changes that seem unrelated to the stated purpose? Flag them.
   - Does the PR description adequately explain the "why"?

3. **Map the Blast Radius**
   - Identify all components, hooks, and utilities that are directly modified.
   - For each modified component, API, or function, perform a system-wide search to identify **every place it is consumed.** Document the full list of dependencies and integration points -- this is a non-negotiable step.
   - Check if any changes touch the dynamic plugin SDK public API (`console-dynamic-plugin-sdk/src/api/internal-*.ts`).
   - Check if shared components or utilities are affected.

4. **Assess Risk Profile**
   Rate each dimension as Low / Medium / High:
   - **Scope:** How many files/components are affected?
   - **Complexity:** How complex are the logic changes?
   - **Shared surface:** Do changes touch shared code consumed by other plugins/packages?
   - **User-facing:** Are there visible UI changes?
   - **Data flow:** Do changes affect data fetching, state management, or API calls?

5. **Classify Change Visibility**
   Determine which category this PR falls into. This classification drives the Human Verification approach in Phase 3.

   - **UI-visible:** Changes to components, styles, layouts, or user-facing text. The change can be seen in the browser. → Phase 3 requires full human verification with browser checklist. Hard pause.
   - **Behavioral:** Changes to hooks, state management, data flow, or API calls that affect runtime behavior but have no direct visual change. → Phase 3 human verification is optional. If a cluster is available, suggest DevTools checks (Network tab, React DevTools profiler, console errors). Soft pause.
   - **Non-UI:** Changes to utilities, types, build config, test-only files, or backend code. Nothing to see in the browser. → Phase 3 skips human verification entirely. Mark as N/A.

**Change Visibility:** [UI-visible | Behavioral | Non-UI]

**Summary:**

**Change Categories:**
-

**Blast Radius:**
-

**Risk Profile:**
-

**Concerns or Red Flags:**
-

---

## Phase 1: Test Assessment

**Status:** [Completed | In Progress | Not Started]
**Last Updated:** YYYY-MM-DD

**Directive:** Assess whether the changes are adequately tested and testable. Code quality and standards compliance are the code reviewer's responsibility -- your job is to answer: "How do we know this works?"

Read TESTING.md before starting this phase.

1. **Author's Test Plan Review**
   - Review the author's test plan from the PR description (captured in Mission Briefing).
   - Does it cover the acceptance criteria from the Jira issue?
   - Are the manual verification steps clear and reproducible?
   - Are there scenarios the author didn't include? Note what's missing.

2. **Test Coverage Analysis**
   - What tests were added or modified in this PR?
   - Do the new/modified tests cover the acceptance criteria from the Jira issue?
   - Do the tests follow the patterns and conventions in TESTING.md?
   - Are the tests testing user-visible behavior (not implementation details)?

3. **Test Gap Identification**
   - What acceptance criteria or user workflows are NOT covered by automated tests?
   - Are there edge cases, error paths, or boundary conditions that lack coverage?
   - Are there existing tests for the affected area that should have been updated but weren't?
   - For each gap, note whether it should be covered by unit tests, integration tests (Cypress), or manual testing.

4. **Testability Assessment**
   - Can the acceptance criteria be verified through automated tests, manual testing, or both?
   - If manual testing is required, what are the preconditions (running cluster, specific resources, permissions)?
   - Are there aspects of the change that are difficult to test automatically (e.g., visual layout, timing-dependent behavior)?

5. **Test Plan**
   Build a concrete test plan for Phase 3 (Functional Verification):
   - Which automated tests to run and what to look for in the results.
   - Which manual verification steps to perform (if a cluster is available).
   - Which edge cases and error paths to exercise.

**Summary:**

**Tests Added/Modified:**
-

**Test Gaps:**
-

**Test Plan for Phase 3:**
-

---

## Phase 2: Automated Quality Gates

**Status:** [Completed | In Progress | Not Started]
**Last Updated:** YYYY-MM-DD

**Directive:** Run all relevant automated checks against the PR branch. Every gate must pass. Provide complete, unedited output for each gate -- do not summarize or truncate test results.

**Efficiency:** Run independent gates in parallel when possible (e.g., lint + unit tests + i18n can run simultaneously). Only gates with dependencies (e.g., build verification depends on type checking) need to run sequentially.

**If any gate fails:** Stop and flag the failure immediately. Do not proceed to Phase 3. Document the failure with full output and note whether it appears to be introduced by the PR or pre-existing.

Execute the following checks:

1. **Linting**
   - Run `cd frontend && yarn eslint <changed-files>` for each changed frontend file.
   - Document any lint errors or warnings with full output.

2. **TypeScript Type Checking**
   - Run `cd frontend && yarn build` (or a targeted type-check if available).
   - Document any type errors with full output.

3. **Unit Tests**
   - Run tests for changed files: `cd frontend && yarn test <path-to-changed-test-or-component>`.
   - Run tests for consumers of changed components if applicable.
   - Provide complete, unedited test output.

4. **i18n Validation** (if user-facing strings were changed)
   - Run `cd frontend && yarn i18n` and check for uncommitted changes.
   - Verify no missing keys or template literal usage in `t()` calls.

5. **Build Verification**
   - Confirm the project builds successfully: `cd frontend && yarn build`.
   - Document any build errors with full output.

**Gate Results:**

| Gate | Status | Details |
|------|--------|---------|
| Lint | [Pass / Fail / Skipped] | ... |
| Types | [Pass / Fail / Skipped] | ... |
| Unit Tests | [Pass / Fail / NO COVERAGE / Skipped] | ... |
| i18n | [Pass / Fail / Skipped / N/A] | ... |
| Build | [Pass / Fail / Skipped] | ... |

**Unit test status guidance:** If no tests exist for the changed files and `--passWithNoTests` exits 0, the status is **NO COVERAGE**, not "Pass." A pass requires actual test assertions to have executed and succeeded. "No tests found" is the absence of verification, not evidence of correctness.

**Failures:**
-

**Notes:**
-

---

## Phase 3: Functional Verification

**Status:** [Completed | Completed (code analysis only) | In Progress | Not Started]
**Last Updated:** YYYY-MM-DD

**Status guidance:** Use "Completed" when human verification was performed (for UI-visible/Behavioral changes) or is N/A (for Non-UI changes). Use "Completed (code analysis only)" when UI-visible or Behavioral changes were verified only through code trace without a running cluster or browser. The Progress Ledger marker should match: ✅ vs ✅🔍.

**Directive:** Verify that the PR's changes work correctly from a user's perspective. This is the most critical phase -- automated tests prove code correctness, but functional verification proves feature correctness.

**Before starting this phase:** Phase 2 must have passed. The branch is now safe to run locally. Pause and present the user with:

1. Confirmation that the branch is ready for hands-on testing.
2. How to start the dev server: `cd frontend && yarn dev` (or `yarn dev-once` for a single build).
3. The tailored Human Verification checklist (step 7 below), based on the change type identified in Phase 0.
4. Instruction: "You can start manual testing now while I continue with the analytical verification steps below. Report your findings when ready."

Claude proceeds with steps 1-6 (analytical verification) while the user performs step 7 (human verification) in parallel. Phase 3 is not complete until both tracks are done.

0. **Architecture Context**
   Before verifying individual criteria, document the relevant architecture: how do the changed components interact? What are the data flow paths? This section helps future readers understand the report without reading all the code.
   - Map the key data flows affected by the PR (e.g., "user types → state update → URL update → API call").
   - Identify parallel mechanisms that must stay in sync (e.g., Redux state vs URL params vs component state).
   - Note any non-obvious interactions between the changed code and the broader system.

1. **Execute the Author's Test Plan**
   - Start with the author's test plan from the PR description as the baseline.
   - Follow their manual verification steps exactly. Do they work as described?
   - Run any test commands they specified. Do the results match their claims?
   - Note any steps that are unclear, fail, or produce unexpected results.

2. **Acceptance Criteria Walkthrough**
   - For each acceptance criterion from the Jira issue:
     - Define the test scenario (preconditions, steps, expected result).
     - If the user has a running cluster, guide them through manual verification steps.
     - If no cluster is available, verify through code analysis and existing test coverage.
   - Record the verdict for each criterion in the Verification Checklist above.
   - Note any acceptance criteria NOT covered by the author's test plan.

3. **Happy Path Testing**
   - Identify the primary user workflow(s) affected by this change.
   - Verify the golden path works end-to-end.

4. **Edge Case and Error Path Testing**
   - Test boundary conditions (empty states, max values, special characters).
   - Test error conditions (network failures, invalid input, permission errors).
   - Test loading states and transitions.

5. **Cross-cutting Concerns**
   - If UI changes: verify responsiveness and layout at different viewport sizes.
   - If form changes: verify validation, submission, and error display.
   - If navigation changes: verify URL routing and browser back/forward behavior.

6. **Test Coverage Assessment**
   - Are the new/changed behaviors adequately covered by automated tests?
   - Are there critical paths that lack test coverage? Flag them.
   - If tests are missing, document what tests should be added (but do not write them -- you are verifying, not implementing).

**⏸ CHECKPOINT (UI-visible and Behavioral changes only):** After completing steps 0-6, stop and ask the user for their manual testing results before marking Phase 3 complete. Do not proceed to Phase 4 until the user's findings (or explicit skip/no cluster) are recorded in the Human Verification Results section below. For Non-UI changes, skip this checkpoint — record "N/A -- Non-UI change" and proceed directly.

7. **Human Verification**
   This step cannot be performed by Claude -- it requires a human with a browser. The approach depends on the Change Visibility classification from Phase 0.

   **UI-visible changes -- Full checklist (hard pause, required):**

   Always verify:
   - [ ] Open the browser console (DevTools) before starting. Note any pre-existing errors, then monitor for new errors, warnings, or uncaught exceptions throughout testing.
   - [ ] Navigate to the affected area and confirm it loads without errors.

   If the PR includes visual changes:
   - [ ] Visual rendering matches the expected design or screenshots in the PR/Jira.
   - [ ] Layout is correct at standard viewport sizes (desktop, tablet breakpoints).
   - [ ] Text is readable, properly aligned, and not truncated or overflowing.
   - [ ] Colors, spacing, and typography are consistent with surrounding UI (PatternFly conventions).
   - [ ] Animations and transitions (if any) feel smooth and intentional.
   - [ ] Dark/light theme (if applicable) renders correctly.

   If the PR includes interactive changes (forms, buttons, modals, etc.):
   - [ ] Click, hover, and focus states behave correctly.
   - [ ] Keyboard navigation works (Tab, Enter, Escape, arrow keys as appropriate).
   - [ ] Form validation displays errors correctly and clears them appropriately.
   - [ ] Loading states and spinners appear and disappear as expected.

   If the PR includes data display changes (lists, tables, details pages):
   - [ ] Data renders correctly with real/representative data.
   - [ ] Empty states display appropriately when no data exists.
   - [ ] Pagination, sorting, and filtering work correctly (if applicable).

   Record results:
   - Note any browser console errors observed (copy the exact error message).
   - Take screenshots of any visual issues.
   - Report pass/fail for each applicable checklist item.

   **Behavioral changes -- DevTools checks (soft pause, optional):**

   If a cluster is available, check:
   - [ ] Browser console: monitor for new errors, warnings, or uncaught exceptions.
   - [ ] Network tab: verify request patterns match expectations (no duplicate requests, correct endpoints, expected payloads).
   - [ ] React DevTools profiler: check render counts for affected components (if applicable).
   - [ ] Verify the affected feature still works end-to-end (even if it looks the same).

   If no cluster is available, record: "Behavioral change -- no cluster available for runtime verification."

   **Non-UI changes -- N/A:**

   Record: "N/A -- Non-UI change (utilities/types/config/tests). No browser verification applicable."

**Summary:**

**Acceptance Criteria Results:**
-

**Functional Issues Found:**
-

**Missing Test Coverage:**
-

**Human Verification Results:**
- **Change Visibility:** [UI-visible | Behavioral | Non-UI]
- **Status:** [Completed / Skipped -- no cluster / N/A -- Non-UI change]
- **Browser console errors:** [None observed / List errors / Not checked]
- **Visual issues:** [None observed / List issues / N/A]
- **Interaction issues:** [None observed / List issues / N/A]
- **DevTools observations:** [Network/profiler findings / N/A]

**Manual Verification Steps Performed:**
For each manual test, document with enough detail to reproduce: the preconditions, exact steps taken, and observed outcome.

| Test | Steps | Expected Outcome | Actual Outcome | Result |
|------|-------|-------------------|----------------|--------|
| ... | ... | ... | ... | [Pass / Fail] |

---

## Phase 4: Regression Assessment

**Status:** [Completed | In Progress | Not Started]
**Last Updated:** YYYY-MM-DD

**Directive:** Determine whether the PR introduces any regressions in existing functionality. Focus on the blast radius identified in Phase 0.

1. **Consumer Impact — Show Your Work**
   - From the blast radius mapped in Phase 0, list every consumer category (direct, indirect, SDK/public API).
   - For each consumer (or representative consumer from each category), trace through a concrete scenario to demonstrate safety. Do not just assert "consumers are unaffected" — show the reasoning with specific values. Example:
     - "Consumer: `pod-list.tsx` with `initialFilters = { name: '', label: '', status: [] }`"
     - "Scenario: initial mount → `searchParams.getAll('status')` returns `[]`, `filtersRef.current.status` = `[]` → no divergence → no action. **Safe.**"
   - Run the consumer's tests if they exist. Document results.

2. **Cross-Reference Verification**
   - Explicitly test at least one critical feature that is **related to, but was not directly modified by,** the PR to detect unexpected side effects.
   - Focus on features that share code, state, or data flow with the changed area.
   - When testing multiple independent features, verify them simultaneously for efficiency.

3. **Backward Compatibility**
   - If the PR modifies shared utilities or SDK code:
     - Verify that existing callers are not broken.
     - Check that deprecated APIs (if any) still function.
   - If the PR modifies extension points:
     - Verify that existing static and dynamic plugin extensions still work.

4. **Run Broader Test Suite**
   This step is required when changes touch shared code. It is recommended for all PRs as a baseline confidence check.
   - **Always run:** The full test suite for the package(s) containing the changed files. Document exact command and full results (suites, tests, pass/fail counts).
   - **If shared code changed:** Also run test suites for at least 2-3 direct consumers of the changed code. Choose consumers that exercise different usage patterns (e.g., one with custom filters, one with default filters). If a consumer's tests fail, determine whether the failure is pre-existing (run the same tests on `main`) or introduced by the PR.
   - **Document what you ran and what you didn't.** If a consumer has no tests, say so. If you chose not to run a suite, explain why (e.g., "no test files exist for this consumer").

**Summary:**

**Regressions Found:**
-

**Consumers Verified:**
-

**Broader Test Results:**
-

---

## Phase 5: Final Verdict

**Status:** [Completed | In Progress | Not Started]
**Last Updated:** YYYY-MM-DD

**Directive:** Synthesize all findings from Phases 0-4 into a clear, actionable verdict. This is the sign-off.

**Independent State Verification:** Do not rely on observations from earlier phases if this verification has spanned multiple sessions. Before issuing a verdict, confirm the branch state is current (check for rebases, force-pushes, or new commits since you last ran tests). If the branch has changed, re-run the Phase 2 quality gates with fresh commands before proceeding.

### Verdict Summary

1. **Functional Completeness**
   - Are all acceptance criteria met?
   - Are there gaps or partial implementations?

2. **Verification Evidence**
   - Reference the concrete commands run and their outputs from Phases 2-4 (e.g., passing test output, full test suite results, lint output, build status).
   - Do not simply assert "tests pass" -- link to or quote the evidence (e.g., "Unit tests: 47 passed, 0 failed -- see [02-Automated-Tests.md](02-Automated-Tests.md)").

3. **System-Wide Impact Statement**
   - Confirm that all dependencies and consumers identified in the blast radius (Phase 0) have been checked.
   - State whether all consumers are consistent and unaffected, or list any that were impacted.

4. **Risk Assessment**
   - What is the overall risk of merging this PR?
   - Are there any blocking issues?

5. **Recommendations**
   - List any required changes before the PR can be merged.
   - List any suggested (non-blocking) improvements.
   - Note any follow-up work that should be tracked.

### CodeRabbit Cross-Reference

This repo has CodeRabbit AI enabled, which independently reviews every PR. After completing your own independent analysis in Phases 0-4, fetch CodeRabbit's review and compare.

**Important:** Do not read CodeRabbit's comments before completing Phases 0-4. The value is in independent analysis -- two unbiased opinions surface more issues than one informed by the other.

1. **Fetch CodeRabbit's review comments**
   - Run `gh api repos/openshift/console/pulls/<pr-number>/reviews` to get review comments.
   - Run `gh api repos/openshift/console/pulls/<pr-number>/comments` to get inline comments.
   - Identify comments authored by CodeRabbit (look for `coderabbitai` or similar bot user).

2. **Compare findings**
   For each CodeRabbit comment, classify it:
   - **Agreement:** Both this review and CodeRabbit flagged the same issue. Strengthens confidence.
   - **CodeRabbit-only:** CodeRabbit found something this review missed. Evaluate whether it's a genuine concern or a false positive.
   - **This review-only:** This review found something CodeRabbit missed. Note it as added value.
   - **Disagreement:** This review and CodeRabbit reached opposite conclusions on the same area. Document both perspectives -- the disagreement itself is useful signal for the developer.

3. **Check resolution status**
   - Are there unresolved CodeRabbit comments? If so, flag them.
   - Did the PR author dismiss any comments without addressing them? Note which ones and whether the dismissal seems justified.

**Cross-Reference Summary:**

| Category | Count | Details |
|----------|-------|---------|
| Agreement | | |
| CodeRabbit-only | | |
| This review-only | | |
| Disagreement | | |
| Unresolved CR comments | | |

**Notable Discrepancies:**
-

### Final Verdict

Conclude with one of the following:

- **APPROVED:** "Verification Complete. All acceptance criteria met. All quality gates pass. No regressions identified. This PR is safe to merge."
- **APPROVED WITH NOTES:** "Verification Complete. All acceptance criteria met. Non-blocking observations documented. This PR is safe to merge with the noted follow-ups."
- **CHANGES REQUESTED:** "Verification Complete. Issues found that must be addressed before merge: [list blocking issues]. Recommend returning to the PR author for fixes."
- **BLOCKED:** "Verification Incomplete. Unable to fully verify due to: [list blockers]. Cannot provide a merge recommendation."

**Verdict:** [APPROVED | APPROVED WITH NOTES | CHANGES REQUESTED | BLOCKED]

**Confidence Level:** [High | Medium | Low]
- **High:** All information available, all phases completed thoroughly, no gaps.
- **Medium:** Some information gaps (see Information Gaps section) that limited verification scope. Verdict carries caveats.
- **Low:** Significant information gaps. Verification was best-effort. Verdict should be treated as preliminary.

**Information Gaps Affecting Confidence:**
-

**Blocking Issues:**
-

**Non-Blocking Observations:**
-

**Follow-up Work:**
-

---

## Verification Log
A chronological record of significant actions and findings during verification.

| Date | Phase | Action | Finding |
|------|-------|--------|---------|
| YYYY-MM-DD | 0 | ... | ... |
