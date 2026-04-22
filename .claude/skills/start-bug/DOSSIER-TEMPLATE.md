---
bug: OCPBUGS-<number>
title: <Issue Title from Jira>
branch: OCPBUGS-<number>-<Short-Title>
created: YYYY-MM-DD
last-updated: YYYY-MM-DD
---

# OCPBUGS-<number>: <Issue Title>

## Investigation Status
**Overall Status:** [Not Started | In Progress | Verification | Completed]  
**Current Phase:** Phase X – Phase Name  
**Started:** YYYY-MM-DD  
**Last Activity:** YYYY-MM-DD  

## Quick Links
- **Jira:** https://issues.redhat.com/browse/OCPBUGS-<number>
- **Branch:** `OCPBUGS-<number>-<Short-Title>`

---

## Mission Briefing
Your approach must be systematic, evidence-based, and relentlessly focused on identifying and fixing the **absolute root cause.** Patching symptoms is a critical failure.

**Key Details from Jira:**
- **Summary:** ...
- **Description:** (condensed key points)
- **Acceptance Criteria:** ...
- **Related Links / Attachments:** ...

---

## Phase 0: Reconnaissance & State Baseline (Read-Only)

**Directive:** Strictly following the **OPERATIONAL DOCTRINE**, perform a thorough, read-only reconnaissance to establish a high-fidelity, evidence-based baseline of the current system state as it relates to this OCPBUGS issue.

You **must** execute the following steps in order:

1. **Identify the Scope**
   - Extract the exact OCPBUGS Jira ID and title from the current context or user input.
   - Identify all files, components, modules, and dependencies that are likely relevant to the reported bug (including changed files in the associated PR if available).

2. **Read Critical Files**
   - Read the full content of all directly modified files from the PR (if applicable).
   - Read all related components, hooks, reducers, utils, and tests that interact with the changed code.
   - Pay special attention to: dynamic plugins, PatternFly components, Redux state handling, API calls, and error boundaries.

3. **Analyze Recent Changes**
   - Summarize the intent and actual code changes introduced in the relevant PR(s).
   - Highlight any risky patterns (e.g., direct DOM manipulation, missing null checks, state mutation, async handling changes).

4. **Establish Baseline State**
   - Document the current behavior of the affected feature/component **before** any fix is applied.
   - Note expected vs observed behavior based on the bug report.
   - Capture relevant console errors, network requests, or Redux state snapshots if visible.

5. **Output Format**
   - Produce a concise digest (≤ 300 lines) of your findings.
   - Use clear markdown sections with evidence-based observations only.
   - End with a concise "Baseline Summary" containing:
     - Affected components/files (with paths)
     - Core suspected areas
     - Current known symptoms vs expected behavior
     - Any open questions that require clarification
     - Open questions or uncertainties
     - Any critical missing information needed for further analysis

**Rules:**
- Do **not** propose any fixes or changes yet.
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

**Open Questions:**
- 

---

## Phase 1: Isolate the Anomaly

**Status:** [Completed | In Progress | Not Started]  
**Last Updated:** YYYY-MM-DD  
**Summary:** 

**Directive:**  
The goal of this phase is to **establish a reliable way to reproduce the bug** consistently. For Console UI bugs, prioritize practical reproduction methods (UI steps or existing tests) over writing new tests when possible.

You **must** execute the following steps in order:

1. **Define Correct vs Observed Behavior**
   - Clearly document the **expected** (correct) behavior based on the Jira issue and acceptance criteria.
   - Clearly document the **observed** (buggy) behavior, including symptoms, error messages, or test failures.

2. **Choose the Most Effective Reproduction Method**
   - **If the bug manifests in the UI:**
     - Attempt to reproduce it manually in the running Console.
     - Document precise, step-by-step UI reproduction instructions (navigation path, actions, preconditions).
   - **If the bug is a failing test:**
     - Use the existing failing test as the primary reproduction method.
     - Run the test locally and document the exact failure.
   - **If the bug is intermittent or flaky:**
     - Focus on narrowing down the conditions (timing, specific state, race condition, etc.) until reproduction becomes reliable.
3. **Pinpoint the Trigger Conditions**
   - Identify the exact sequence of events, inputs, state, or timing that causes the failure.
   - Document:
     - Preconditions (specific component state, Redux state, API responses, etc.)
     - Triggering action (user interaction, API call, prop change, etc.)
     - Observed failure mode
4. **Optional: Create a Minimal Reproducible Test**
   - Only if the bug cannot be reliably reproduced via UI steps or existing tests:
     - Create a **minimal, focused automated test** that fails precisely because of this bug.
   - The test should be as small and specific as possible, deterministic, and useful as a future regression guard.
   - Only proceed with creating a test after explicit user approval or when clearly beneficial.
5. **Capture Evidence During Reproduction**
   - Record relevant details:
     - Console/browser errors
     - Network requests/responses
     - Redux state or component props (when accessible)
     - Test output / logs
     - Screenshots (if helpful)

6. **Validate Reproducibility**
   - Confirm the reproduction is consistent (run multiple times if automated, or verify steps if manual).
   - If still flaky, continue refining the trigger conditions.

**Output Format:**
End this phase with an **Summary** containing:
- Expected vs Observed behavior
- Chosen reproduction method
- Detailed reproduction instructions
- Key evidence captured
- Any remaining open questions or blocking issues

**Strict Constraints:**
- Do **not** attempt any fixes during this phase.
- Do **not** modify production code.
- Prefer using existing failing CI tests when they already surface the bug.
- Only create a new test if the bug cannot be reliably reproduced through UI steps or existing tests.

**Summary:**

**Observed Behavior:**
- 

**Expected Behavior:**
- 

**Anomaly Isolated To:**
- 

**Open Questions:**
-

---

## Phase 2: Root Cause Analysis (RCA)
**Status:** [Completed | In Progress | Not Started]  
**Last Updated:** YYYY-MM-DD  

**Directive:** With a reproducible failure, you will now methodically investigate the failing pathway to find the definitive root cause.
-   **Evidence-Gathering Protocol:**
    1.  **Formulate a Testable Hypothesis:** State a clear, simple theory about the cause (e.g., "Hypothesis: The user authentication token is expiring prematurely.").
    2.  **Devise an Experiment:** Design a safe, non-destructive test or observation to gather evidence that will either prove or disprove your hypothesis.
    3.  **Execute and Conclude:** Run the experiment, present the evidence, and state your conclusion. If the hypothesis is wrong, formulate a new one based on the new evidence and repeat this loop.

**Summary:** 

**Hypotheses Tested:**
- 

**Root Cause (if identified):**
- 

**Evidence:**
- 

**Open Questions:**
- 

---

## Phase 3: Remediation
**Status:** [Completed | In Progress | Not Started]  
**Last Updated:** YYYY-MM-DD  

**Directive:** Design and implement a minimal, precise fix that durably hardens the system against the confirmed root cause.
-   **BLOCKING REQUIREMENT — Read Project Standards Before Writing Code:**
    Before making ANY code changes, you **MUST** read `AGENTS.md` and ALL files it references that are relevant to the fix area. This includes but is not limited to:
    - `STYLEGUIDE.md` — code style for TypeScript, Go, and SCSS
    - `TESTING.md` — testing frameworks, patterns, and best practices
    - `INTERNATIONALIZATION.md` — i18n patterns (if user-facing strings are affected)
    - `CONTRIBUTING.md` — contribution workflow and commit conventions

    Do NOT rely on system-reminder previews or prior conversation context. Read the actual files. If you have not read these files in this session, **stop and read them now** before proceeding.
-   **Core Protocols in Effect:**
    -   **Read-Write-Reread:** For every file you modify, you must read it immediately before and after the change.
    -   **System-Wide Ownership:** If the root cause is in a shared component, you are **MANDATED** to analyze and, if necessary, fix all other consumers affected by the same flaw.

**Summary:**

**Changes Made:**
- 

**Files Modified:**
- 

**Rationale:**
- 

---

## Fix Rationale
**Status:** [Completed | In Progress | Not Started]  
**Last Updated:** YYYY-MM-DD  

**Directive:** Synthesize a clear argument for *why* this fix is the correct approach. This section should be understandable by someone who has not read the rest of the dossier and should survive context loss between conversations.

Address each of the following:

1. **Why is the current (broken) behavior wrong?**
   - What assumption or contract is being violated, and what changed to expose it?

2. **Why does the fix target this layer?**
   - Explain why the fix belongs where it does (e.g., test code vs production code, component vs caller, config vs logic). Explicitly address alternatives that were considered and why they were rejected.

3. **Why are the specific changes correct?**
   - For each modified file, explain what the change does and why it resolves the root cause — not just *what* changed, but *why that change* is the right one.

4. **Why won't this fix cause regressions?**
   - Explain why the change is safe for all existing callers and does not alter production behavior.

**Rationale:**
- 

**Alternatives Considered & Rejected:**
- 

---

## Phase 4: Verification & Regression Guard
**Status:** [Completed | In Progress | Not Started]  
**Last Updated:** YYYY-MM-DD  

**Directive:** Prove that your fix has resolved the issue without creating new ones.
-   **Verify Compliance with Project Standards:** Review all code changes against the `AGENTS.md` referenced files consulted in Phase 3 (STYLEGUIDE.md, TESTING.md, etc.). Confirm that changes follow the project's coding conventions, testing patterns, and architectural rules. Flag any deviations.
-   **Adhere to Learned Principles:** Review code changes against `.claude/local/rules/Learned-Principles-and-Takeaways.md`. Focus on lessons that aren't automated via PostToolUse hooks.
-   **Verification Steps:**
    1.  **Confirm the Fix:** Re-run the specific failing test case from Phase 1. It **MUST** now pass.
    2.  **Run Full Quality Gates:** Execute the entire suite of relevant tests (unit, integration, etc.) and linters to ensure no regressions have been introduced elsewhere.
    3.  **Autonomous Correction:** If your fix introduces any new failures, you will autonomously diagnose and resolve them.

**Summary:** 

**Verification Steps Performed:**
- 

**Regression Tests Ran:**
- 

**Results:**
- 

---

## Phase 5: Mandatory Zero-Trust Self-Audit
**Status:** [Completed | In Progress | Not Started]  
**Last Updated:** YYYY-MM-DD  

**Directive:** Your remediation is complete, but your work is not done. You will now conduct a skeptical, zero-trust audit of your own fix.
-   **Audit Protocol:**
    1.  **Re-verify Final State:** With fresh commands, confirm that all modified files are correct and that all relevant services are in a healthy state.
    2.  **Hunt for Regressions:** Explicitly test the primary workflow of the component you fixed to ensure its overall functionality remains intact.
    3.  **Confirm System-Wide Consistency:** Double-check that all consumers of any changed component are working as expected.
   
**Summary:** 

**Audit Findings:**
- 

**Risks Identified:**
- 

**Mitigations:**
- 

---

## Phase 6: Final Report & Verdict
**Status:** [Completed | In Progress | Not Started]  
**Last Updated:** YYYY-MM-DD  

**Directive:** Conclude your mission with a structured "After-Action Report"
-   **Report Structure:**
    -   **Root Cause:** A definitive statement of the underlying issue, supported by the key piece of evidence from your RCA.
    -   **Remediation:** A list of all changes applied to fix the issue.
    -   **Verification Evidence:** Proof that the original bug is fixed (e.g., the passing test output) and that no new regressions were introduced (e.g., the output of the full test suite).
    -   **Final Verdict:** Conclude with one of the two following statements, exactly as written:
        -   `"Self-Audit Complete. Root cause has been addressed, and system state is verified. No regressions identified. Mission accomplished."`
        -   `"Self-Audit Complete. CRITICAL ISSUE FOUND during audit. Halting work. [Describe issue and recommend immediate diagnostic steps]."`
-   **Constraint:** Maintain an inline TODO ledger using ✅ / ⚠️ / 🚧 markers throughout the process.

**Summary:** 

**Root Cause:**
- 

**Fix Summary:**
- 

**Verification Outcome:**
- 

**Verdict:** [Root Cause Fixed | Partial Fix | Needs Further Investigation | Ready for Review]

---

## Lessons Learned Updates (optional)
- 