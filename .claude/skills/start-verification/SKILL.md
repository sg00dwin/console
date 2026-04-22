---
name: start-verification
description: Bootstrap or resume a structured, phased verification of a pull request — from PR/Jira context gathering and change analysis through automated quality gates, functional testing (with human verification gates for UI changes), regression assessment, and a formal verdict. Manages verification branches, report tracking, and phase-by-phase progress.
allowed-tools: mcp__jira__jira_get_issue, Read, Grep, Glob, Bash(git *), Bash(gh *), Bash(cd frontend && yarn test *), Bash(yarn test *), Bash(cd frontend && yarn eslint *), Bash(yarn eslint *), Bash(cd frontend && yarn build *), Bash(yarn build *), Bash(npx *), Bash(pwd), Bash(ls *), Bash(mkdir *), AskUserQuestion, Write, Edit, Agent(Explore)
trigger: start-verification, verify, verification
---

# /start-verification Skill -- Structured PR Verification

## Context
This skill provides a structured, repeatable process for verifying that a pull request meets its acceptance criteria, passes all quality gates, and introduces no regressions.

**Purpose:**
This skill sets up (or resumes) a clean, trackable environment for testing and verification of a pull request linked to a Jira issue (CONSOLE story/sub-task or OCPBUGS bug). It helps the user systematically verify the PR and produce a documented verdict.

**Role:**
You are a QA engineer verifying this PR for merge readiness. Be thorough, skeptical, and evidence-based. Your job is to find problems, not fix them. If something is broken, document it -- do not remediate.

Validate everything. Assume nothing. Prevent breakage, hidden regressions, and inconsistencies before they reach production.

## Arguments

- `$0` — PR number or URL (required)
- `$1` — (optional) `auto` — Skip phase-boundary confirmation prompts and run all phases continuously. Equivalent to the user saying "continue through all phases." Mandatory pause points (blocking issues, Phase 2→3 for UI changes, and Phase 5 verdict) still apply.

When the user invokes this command, follow these steps:

---

### Step 0: Validate Input

**CRITICAL: Always ask for explicit input.** Do NOT infer the PR from the current branch name, git history, or any other ambient context. The user may be on an unrelated branch.

If no Pull Request number or URL was provided as an argument:
  - Simply ask the user in your text response: "Which Pull Request should I verify? Please provide the PR number or URL."
  - Do NOT use `AskUserQuestion` for this — just ask in plain text so the user can type their answer directly.
  - Wait for their response. Do not proceed until an explicit answer is received.

Extract the PR number. If a full URL was provided (e.g., `https://github.com/openshift/console/pull/12345`), parse the number from it.

---

### Step 1: Gather Context

Fetch PR and Jira details in parallel. Perform the information completeness assessment and build the verification checklist internally. Do NOT present a full summary to the user yet -- all gathered data will be presented as part of the unified status in Step 4, after the branch and report are set up.

**Exception:** If blocking information gaps are found in 1c, pause immediately and present them to the user before proceeding to Step 2.

#### 1a: Pull Request Details

- Use `gh pr view <number> --json title,body,state,headRefName,baseRefName,author,labels,files,commits,comments,reviews,reviewRequests,additions,deletions,changedFiles` to fetch PR details.
- Capture the following for later use in the report:
  - **Title**
  - **Author**
  - **State** (open, merged, closed)
  - **Branch** (head -> base)
  - **Labels**
  - **Description** (full text)
  - **Author's test plan** -- Extract any "Test plan", "Tests", "Test Validation", or similar sections from the PR description. Authors often include manual verification steps, commands to run, expected results, and screenshots. Capture these separately -- they are a critical input for Phases 1 and 3.
  - **Files changed** (count and list)
  - **Review status** (approvals, requested changes, pending reviews)

**PR State Handling:**
- **Open:** Normal flow.
- **Merged:** Inform the user this is a post-merge verification. Branch management still works (fetch the merge commit). Note in the report that findings are retrospective.
- **Closed (not merged):** Ask the user if they still want to proceed. The PR may have been superseded.
- **Draft:** Inform the user this PR is still in draft. Proceed but note that findings may change as the PR evolves.

#### 1b: Jira Issue Details

- Extract the Jira issue key from the PR title or branch name (pattern: `CONSOLE-####` or `OCPBUGS-####`).
- If no Jira key can be found, ask the user: "I couldn't find a Jira issue key in the PR. What is the associated Jira issue? (e.g., CONSOLE-1234 or OCPBUGS-5678), or type 'none' if there isn't one."
- If the user responds that there is no associated Jira issue, proceed without one. Use the PR description as the sole source of acceptance criteria. Note in the Information Gaps section: "No Jira issue -- acceptance criteria derived from PR description only." For branch naming, use: `verify/NO-JIRA-PR-<number>-<Short-Title>`.
- Use the Jira MCP tool (`mcp__jira__jira_get_issue`) to fetch full issue details.
- Capture the following for later use in the report:
  - **Title & Summary**
  - **Description** (key points)
  - **Acceptance Criteria** (if any -- these are critical for verification)
  - **Issue type** (Story, Bug, Sub-task)
  - **Related links / Epics / PRs / Google Docs / attachments**

#### 1c: Information Completeness Assessment

Before proceeding, assess whether sufficient information exists to perform a thorough verification. Evaluate the PR and Jira issue against the following checklist and classify each gap by severity:

**For all issue types:**
- Does the PR have a description explaining what changed and why?
- Does the Jira issue have acceptance criteria or a clear definition of done?
- Are there related links, designs, or context that explain the intent?

**For bugs (OCPBUGS) specifically:**
- Are reproduction steps provided?
- Is the expected vs. actual behavior documented?
- Is the affected environment/version noted?
- Are there screenshots, logs, or error messages?

**For stories (CONSOLE) specifically:**
- Are acceptance criteria clearly defined and testable?
- Is there a linked design or UX specification for UI changes?
- Are edge cases or error scenarios described?

Classify each gap:

| Severity | Meaning | Action |
|----------|---------|--------|
| **Blocks verification** | Cannot meaningfully test without this information | Pause and provide the user with specific questions to take to the reporter or PR author |
| **Reduces confidence** | Can proceed but the verdict will carry explicit caveats | Document the gap, proceed, and carry it forward to Phase 5 |
| **Nice to have** | Would improve the report but does not limit verification | Note it and move on |

**If blocking gaps exist:**
- Pause the skill and present the user with:
  - A list of what is missing
  - Specific questions to ask the reporter or PR author (not vague requests -- concrete questions like "What steps reproduce this bug?" or "What should happen when the list is empty?")
  - The option to proceed anyway with reduced confidence, or wait for answers

**If no blocking gaps exist:**
- Present any confidence-reducing gaps to the user for awareness
- Proceed to Step 1d

#### 1d: Build the Verification Checklist

Based on the acceptance criteria and PR description, build a preliminary checklist of what needs to be verified. Present it to the user for review before proceeding. If information gaps were identified in Step 1c, note which checklist items are affected.

---

### Step 2: Verification Branch Management

1. Determine target branch name:
   - If the Jira issue is a CONSOLE-#### story/sub-task: `verify/CONSOLE-<number>-<Short-Title>`
   - If the Jira issue is an OCPBUGS-#### bug: `verify/OCPBUGS-<number>-<Short-Title>`

   The `verify/` prefix distinguishes verification branches from implementation branches.

2. **Check current git status**
   - Run `git status --porcelain` to detect any uncommitted changes.

3. **Handle uncommitted changes (Safety First):**
   - If there are **any uncommitted changes** (modified, staged, or untracked files):
     - Immediately pause the skill and inform the user with this exact message:

       > "I cannot switch branches right now because you have uncommitted changes on the current branch (`{{current-branch-name}}`).
       > Pausing here.
       >
       > Please manually:
       > 1. Commit your changes, or
       > 2. Stash them, then
       >
       > Once you're ready, re-run `/start-verification` and I will continue from where we left off."

     - **Do not** perform any `git checkout`, `git stash`, or `git commit` automatically.
     - Stop execution of the skill at this point.

4. **If the working tree is clean** (no uncommitted changes):
   - Check if a branch matching `verify/<issue-type>-<number>-*` already exists.
   - **If the branch already exists:**
     - Inform the user: "Verification branch `verify/<issue-type>-<number>-<Short-Title>` already exists."
     - Checkout the existing branch: `git checkout verify/<issue-type>-<number>-<Short-Title>`
   - **If the branch does not exist:**
     - Detect the correct remote by running:
       ```
       git remote -v | grep 'openshift/console' | head -1 | awk '{print $1}'
       ```
       This gives the remote name (e.g., `openshift` or `upstream`).
     - Fetch the PR ref so it is available locally:
       ```
       git fetch <remote> pull/<pr-number>/head:pr-<pr-number>
       ```
     - Create the verification branch from the fetched PR head:
       ```
       git checkout -b verify/<issue-type>-<number>-<Short-Title> pr-<pr-number>
       ```
**Rule:** Never delete, reset, or overwrite existing branches.

---

### Step 3: Verification Report Management

The report is a living document updated as verification proceeds through each phase.

1. Report path = `.claude/local/devnotes/VERIFY/<issue-type>-<number>-<Short-Title>/REPORT.md`
2. **If REPORT.md already exists:**
   - Inform the user.
   - Read the full report.
   - Analyze and summarize current progress.
   - **If resuming a partially completed phase:** Read the companion file for the in-progress phase (if it exists) to understand what was already done. Present the user with what has been completed and what remains. Ask: "Should I continue from where we left off, or restart this phase?"
3. **If REPORT.md does not exist:**
   - Create the directory `.claude/local/devnotes/VERIFY/<issue-type>-<number>-<Short-Title>/`
   - Copy the content from the template:
     `.claude/skills/start-verification/REPORT-TEMPLATE.md`
   - Populate frontmatter with PR and Jira details (PR number, issue key, title, description, acceptance criteria, files changed, etc.).

#### Companion Reference Files

Each phase may produce detailed analysis that is too long for the report itself. Store these as companion files in the same directory using this naming convention:

```
REPORT.md               # Status dashboard + phase summaries (kept concise)
00-Change-Analysis.md   # Phase 0: Understanding the change
01-Test-Assessment.md   # Phase 1: Test coverage and test plan
02-Automated-Tests.md   # Phase 2: Automated test results
03-Functional.md        # Phase 3: Functional verification evidence
04-Regression.md        # Phase 4: Regression assessment
05-Verdict.md           # Phase 5: Final verdict and sign-off
```

**Rules:**
- The REPORT.md phase section should contain a short summary and link to the companion file (e.g., `See [00-Change-Analysis.md](00-Change-Analysis.md)`).
- Only create a companion file when the phase detail exceeds what fits comfortably in the report (~30 lines).
- Ad-hoc reference files can be inserted using letter suffixes (e.g., `03a-Screenshots.md`).

---

### Step 4: Report Status and Offer Next Action

After successfully handling the branch and report:

1. Re-read the current `REPORT.md`.
2. Provide a clear status report including:
   - PR number and branch name
   - Jira issue and type
   - Report location
   - Overall status and current phase
   - Progress table (Phase | Status | Last Updated | Summary)
   - Verification checklist status

3. Offer context-aware next steps:
   - If early in the process: Ask if they want to start **Phase 0: Change Analysis**.
   - If already in progress: Ask whether to continue the current phase, re-run a phase, or jump to another.
   - If advanced: Offer to proceed with Final Verdict (Phase 5).

**Phase Execution:**
When the user agrees to proceed with a phase, execute the steps defined in that phase's section of the REPORT-TEMPLATE.md. After completing each phase:
1. Update the phase status in REPORT.md (progress ledger + phase summary section).
2. Create a companion file if the detail exceeds ~30 lines.
3. Add an entry to the Verification Log.
4. Present the updated progress ledger and offer the next phase.

**Phase Boundaries:**
- **Default:** Pause after each phase and present the updated progress ledger. Ask if the user wants to continue to the next phase.
- **Continuous mode:** If the `auto` argument was passed, or the user says "continue through all phases," "run everything," "do them all," or similar, proceed through remaining phases without pausing at each boundary.
- **Always pause on:** phase failure, blocking issue found, or the Phase 2→3 transition for UI-visible changes (mandatory human verification gate).
- **Always pause before Phase 5:** The Final Verdict should be a deliberate step, not auto-executed. Always ask before issuing a verdict.

**Phase Transition -- Phase 2 to Phase 3:**
When Phase 2 (Automated Quality Gates) passes, the behavior depends on the Change Visibility classification from Phase 0:

- **UI-visible changes:** Hard pause. Present the user with:
  - Confirmation that all quality gates passed and the branch is ready for hands-on testing.
  - How to start the dev server: `cd frontend && yarn dev` (or `yarn dev-once` for a single build).
  - The full Human Verification checklist (Phase 3, step 7), tailored to the specific UI changes.
  - Tell the user they can start manual testing in parallel while Claude continues with the analytical steps (Phase 3, steps 1-6).
  - **GATE:** Phase 3 is not complete until both Claude's analytical verification and the user's human verification results are recorded. When Claude finishes steps 0-6, **stop and ask the user for their manual testing results before proceeding to Phase 4.** Use `AskUserQuestion` to prompt: "I've completed the analytical verification for Phase 3. Have you finished manual testing? Please share your findings (pass/fail for each checklist item, any issues observed, browser console errors) so I can record them in the report before moving to Phase 4." Record the user's findings in the Human Verification Results section of the report. Do not proceed to Phase 4 until the user responds.

- **Behavioral changes (hooks, state, data flow):** Soft pause. Inform the user:
  - The branch is ready if they want to test, but there are no visual changes to inspect.
  - If a cluster is available, suggest specific DevTools checks: Network tab (request patterns), React DevTools profiler (render counts), browser console (errors/warnings).
  - Proceed with Claude's analytical steps. When Claude finishes steps 0-6, **pause and ask the user** whether they performed any manual testing. If they did, record findings in the Human Verification Results section. If they didn't or no cluster is available, record "Skipped -- no cluster" and proceed.

- **Non-UI changes (utilities, types, config, tests):** No pause. Inform the user that human verification is not applicable for this change type. Proceed directly with Claude's analytical steps. Record Human Verification as "N/A -- Non-UI change" in the report.

**Core Rules:**
- **Source of truth for testing:** [TESTING.md](TESTING.md) is the authoritative reference for test frameworks, patterns, and best practices. Read it before starting any verification phase that involves running or evaluating tests (Phases 1-4).
- Always be transparent when items already exist.
- Prefer resuming existing work over starting fresh.
- Keep all files inside `.claude/local/devnotes/` (git-ignored).
- You are verifying, not implementing. If you find a defect, document it -- do not fix it.
- **Independence from CodeRabbit:** Do NOT read or fetch CodeRabbit's review comments during Phases 0-4. This repo has CodeRabbit AI enabled, and it independently reviews every PR. The value of this skill is providing a second, unbiased opinion. CodeRabbit's comments are only fetched and cross-referenced in Phase 5 (Final Verdict) after this review's own conclusions are documented.

---

### Step 5: Conclusion

After Phase 5 (Final Verdict) is written and the REPORT.md is fully updated, formally close the verification run with a structured closing statement. This signals to the user that the skill has completed and the conversation is free for other work.

**Output the following block:**

> ---
> **Verification closed: `<ISSUE-KEY>` (PR #`<number>`)**
> **Verdict:** `<APPROVED | APPROVED WITH NOTES | CHANGES REQUESTED | BLOCKED>`
> **Confidence:** `<High | Medium | Low>`
> **Report:** `.claude/local/devnotes/VERIFY/<directory>/REPORT.md`
>
> The verification branch `verify/<branch-name>` can be deleted when no longer needed.
>
> ---

**Rules:**
- This closing block is mandatory after every completed Phase 5. Do not skip it.
- Do not offer next steps or ask follow-up questions within the closing block itself. The block is a clean termination signal.
- After outputting the closing block, the skill run is complete. The user may invoke another skill, start a new verification, or pivot to different work.
- After the closing block, add a brief note: "If you plan to run another `/start-verification`, consider using `/clear` first for a faster, cleaner session. It's optional -- the prior context won't cause problems, but a fresh start reduces processing overhead."
