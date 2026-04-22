---
story: CONSOLE-<number>
title: <Issue Title from Jira>
branch: CONSOLE-<number>-<Short-Title>
created: YYYY-MM-DD
last-updated: YYYY-MM-DD
---

# CONSOLE-<number>: <Issue Title>

## Implementation Status
**Overall Status:** [Not Started | In Progress | Verification | Completed]  
**Current Phase:** Phase X – Phase Name  
**Started:** YYYY-MM-DD  
**Last Activity:** YYYY-MM-DD  

## Quick Links
- **Jira:** https://issues.redhat.com/browse/CONSOLE-<number>
- **Branch:** `CONSOLE-<number>-<Short-Title>`

---

## Mission Briefing

**Key Details from Jira:**
- **Summary:** ...
- **Description:** (condensed key points)
- **Acceptance Criteria:** ...
- **Related Links / Attachments:** ...

---

## Phase 0: Reconnaissance & Mental Modeling (Read-Only)

**Directive:** Perform a thorough, read-only reconnaissance to build a high-fidelity mental model of the codebase area this story touches. Understand before you build. **No artifact may be altered during this phase.**

You **must** execute the following steps in order:

1. **Identify the Scope**
   - Extract the exact CONSOLE Jira ID and title from the current context or user input.
   - Identify all files, components, modules, and dependencies that are likely relevant to the story (including any existing PRs, designs, or related issues).

2. **Read Critical Files**
   - Read the full content of all files in the affected area.
   - Read all related components, hooks, reducers, utils, and tests that interact with the area being changed.
   - Pay special attention to: dynamic plugins, PatternFly components, Redux state handling, API calls, error boundaries, and extension points.

3. **Map Existing Patterns**
   - Identify how similar features are implemented elsewhere in the codebase.
   - Note conventions, abstractions, and shared utilities that should be reused.
   - Identify any existing tests that cover the affected area.

4. **Understand Dependencies**
   - Map upstream and downstream dependencies of the components being modified.
   - Check if any changes would impact the dynamic plugin SDK public API (`console-dynamic-plugin-sdk/src/api/internal-*.ts`).
   - Identify shared components or utilities that other consumers depend on.

5. **Output Format**
   - Produce a concise digest (≤ 300 lines) of your findings.
   - End with a **Baseline Summary** containing:
     - Affected components/files (with paths)
     - Existing patterns to follow
     - Dependencies and potential impact areas
     - Open questions or uncertainties
     - Any critical missing information needed before planning

**Rules:**
- Do **not** propose any implementation yet.
- Do **not** make any write operations.
- Be precise and evidence-driven. Quote code when relevant.
- If information is missing or ambiguous, explicitly state what is needed rather than assuming.

**Status:** [Completed | In Progress | Not Started]  
**Last Updated:** YYYY-MM-DD  
**Summary:**

**Key Findings:**
-

**Files Analyzed:**
-

**Patterns to Follow:**
-

**Open Questions:**
-

---

## Phase 1: Planning & Strategy

**Status:** [Completed | In Progress | Not Started]  
**Last Updated:** YYYY-MM-DD

**Directive:** Using the mental model from Phase 0, design a clear implementation plan before writing any code.

1. **Define the Approach**
   - Break the story into discrete, testable units of work.
   - For each unit, identify the files to create or modify and the changes required.
   - Identify which existing patterns, abstractions, and utilities to reuse.

2. **Assess Risk and Impact**
   - Identify areas where the change could cause regressions.
   - Check for public API impact (dynamic plugin SDK).
   - Note any i18n, accessibility, or performance considerations.

3. **Plan Testing Strategy**
   - Identify what tests are needed (unit, integration, e2e).
   - Note existing tests that need to be updated.
   - Define how acceptance criteria will be verified.

4. **Identify Unknowns**
   - List anything that requires clarification from the user or team before implementation.
   - Flag any architectural decisions that need alignment.

**Summary:**

**Implementation Plan:**
-

**Files to Create/Modify:**
-

**Testing Strategy:**
-

**Risks & Considerations:**
-

**Open Questions:**
-

---

## Phase 2: Execution & Implementation

**Status:** [Completed | In Progress | Not Started]  
**Last Updated:** YYYY-MM-DD

**Directive:** Execute the plan from Phase 1. Build incrementally, verifying each unit of work before moving to the next.

-   **BLOCKING REQUIREMENT — Read Project Standards Before Writing Code:**
    Before making ANY code changes, you **MUST** read `AGENTS.md` and ALL files it references that are relevant to the implementation area. This includes but is not limited to: STYLEGUIDE.md, TESTING.md, INTERNATIONALIZATION.md.
    Do NOT rely on system-reminder previews or prior conversation context. Read the actual files. If you have not read these files in this session, **stop and read them now** before proceeding.
-   **Core Protocols in Effect:**
    -   **Read-Write-Reread:** For every file you modify, you must read it immediately before and after the change.
    -   **Follow Existing Patterns:** Match the conventions identified in Phase 0. Do not introduce new patterns when existing ones suffice.
    -   **Incremental Progress:** Implement one unit of work at a time. Verify it works before moving to the next.

**Summary:**

**Changes Made:**
-

**Files Created:**
-

**Files Modified:**
-

**Implementation Notes:**
-

---

## Fix Rationale
**Status:** [Completed | In Progress | Not Started]  
**Last Updated:** YYYY-MM-DD

**Directive:** Synthesize a clear argument for *why* the implementation approach is correct. This section should be understandable by someone who has not read the rest of the dossier and should survive context loss between conversations.

Address each of the following:

1. **Why is this the right approach?**
   - Explain why this design was chosen over alternatives.

2. **Why do the changes belong in these files/layers?**
   - Explain the architectural placement of the changes. Address alternatives that were considered and why they were rejected.

3. **Why are the specific changes correct?**
   - For each key modified file, explain what the change does and why.

4. **Why won't these changes cause regressions?**
   - Explain why the changes are safe for existing consumers and don't alter unrelated behavior.

**Rationale:**
-

**Alternatives Considered & Rejected:**
-

---

## Phase 3: Verification & Autonomous Correction

**Status:** [Completed | In Progress | Not Started]  
**Last Updated:** YYYY-MM-DD

**Directive:** Prove that the implementation meets the acceptance criteria without introducing regressions.

-   **Verify Compliance with Project Standards:** Review all code changes against the `AGENTS.md` referenced files consulted in Phase 2 (STYLEGUIDE.md, TESTING.md, etc.). Confirm that changes follow the project's coding conventions, testing patterns, and architectural rules. Flag any deviations.
-   **Adhere to Learned Principles:** Review code changes against `.claude/local/rules/Learned-Principles-and-Takeaways.md`. Focus on lessons that aren't automated via PostToolUse hooks.
-   **Verification Steps:**
    1.  **Confirm Acceptance Criteria:** Verify each acceptance criterion from the Jira story is met.
    2.  **Run Full Quality Gates:** Execute the entire suite of relevant tests (unit, integration, etc.) and linters to ensure no regressions have been introduced.
    3.  **Autonomous Correction:** If your implementation introduces any new failures, autonomously diagnose and resolve them.

**Summary:**

**Acceptance Criteria Verified:**
-

**Verification Steps Performed:**
-

**Tests Ran:**
-

**Results:**
-

---

## Phase 4: Mandatory Zero-Trust Self-Audit

**Status:** [Completed | In Progress | Not Started]  
**Last Updated:** YYYY-MM-DD

**Directive:** Your implementation is complete, but your work is not done. Conduct a skeptical, zero-trust audit of your own work.

-   **Audit Protocol:**
    1.  **Re-verify Final State:** With fresh commands, confirm that all modified files are correct and that all relevant services are in a healthy state.
    2.  **Hunt for Regressions:** Explicitly test the primary workflow of the components you changed to ensure their overall functionality remains intact.
    3.  **Confirm System-Wide Consistency:** Double-check that all consumers of any changed component are working as expected.
    4.  **Check for Scope Creep:** Verify that changes are limited to what the story requires — no unrelated modifications.

**Summary:**

**Audit Findings:**
-

**Risks Identified:**
-

**Mitigations:**
-

---

## Phase 5: Final Report & Verdict

**Status:** [Completed | In Progress | Not Started]  
**Last Updated:** YYYY-MM-DD

**Directive:** Conclude with a structured report.

-   **Report Structure:**
    -   **Summary:** What was implemented and why.
    -   **Changes:** A list of all files created or modified.
    -   **Verification Evidence:** Proof that acceptance criteria are met and no regressions were introduced.
    -   **Final Verdict:** Conclude with one of the following statements:
        -   `"Self-Audit Complete. Acceptance criteria met, and system state is verified. No regressions identified. Ready for review."`
        -   `"Self-Audit Complete. CRITICAL ISSUE FOUND during audit. Halting work. [Describe issue and recommend immediate diagnostic steps]."`

**Summary:**

**Changes:**
-

**Acceptance Criteria Status:**
-

**Verification Outcome:**
-

**Verdict:** [Ready for Review | Partial Implementation | Needs Further Work | Blocked]

---

## Lessons Learned (optional)
-
