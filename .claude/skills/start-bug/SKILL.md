---
name: start-bug
description: Bootstrap or resume a structured, phased workflow for an OCPBUGS bug fix — from Jira intake and reconnaissance through root cause analysis, remediation, verification, and self-audit. Manages branch creation, documentation tracking, and phase-by-phase progress.
allowed-tools: mcp__jira__jira_get_issue, mcp__jira__jira_get_issue_comments, mcp__jira__jira_get_attachments, mcp__jira__jira_get_issue_links, mcp__google-docs__drive_files_download, mcp__google-docs__drive_files_get, mcp__google-docs__drive_files_list, Read, Grep, Glob, Bash(git *), Bash(mkdir *), AskUserQuestion, Write, Agent(Explore)
trigger: start-bug, investigate bug, ocpbug
---

# /start-bug Skill – Structured Bug Fix Workflow

**Purpose:**  
This skill sets up (or resumes) a clean, trackable environment for deep bug investigation on OCPBUGS issues and helps the user seamlessly continue at the appropriate phase.

When invoked, follow these steps in order:

### Step 0: Validate Input

If no OCPBUGS issue key was provided as an argument:
  - Ask the user: "Which OCPBUGS issue should I work on? Please provide the issue key (e.g., OCPBUGS-12345)."
  - Wait for their response.

### Step 1: Gather ALL Issue Context

The goal of this step is to retrieve **every piece of information** the bug reporter provided — the full description, all comments, all attachments, and all linked supporting files. Missing any of this context risks an incomplete investigation.

#### 1a: Fetch Issue Details (with link preservation)

The Jira MCP converts ADF (Atlassian Document Format) to plain text, which can **silently drop hyperlinks**. To recover links:

1. Fetch the issue using `mcp__jira__jira_get_issue` with `expand: "renderedFields"` — the rendered HTML preserves links as `<a href>` tags even when the plain text conversion drops them.
2. Extract all URLs from both the plain text `description` and the rendered HTML fields.
3. If the description appears truncated (ends mid-sentence, ends with "See", or is missing expected sections like SUPPORTING FILES), note this for the validation gate in Step 1d.

#### 1b: Fetch Comments, Attachments, and Linked Issues

**Always run this step** — comments and attachments frequently contain critical context (stack traces, error logs, screenshots, Drive links) not present in the description:

- Use `mcp__jira__jira_get_issue_comments` to retrieve all comments.
- Use `mcp__jira__jira_get_attachments` to retrieve all attachments.
- Use `mcp__jira__jira_get_issue_links` to fetch all linked issues (related issues, epics, blockers). For each linked issue, check its comments and attachments for additional supporting files or Drive links.
- Extract all URLs from comment bodies.

#### 1c: Retrieve ALL Linked Supporting Files

Collect every URL found across the description, rendered HTML, comments, linked issues, and attachment metadata. For each URL:

**Google Drive links** (matching `drive.google.com` or `docs.google.com`):
1. Extract the file or folder ID from the URL.
2. If a **folder** link: use `mcp__google-docs__drive_files_list` to list contents and get each file's ID.
3. For each file: use `mcp__google-docs__drive_files_get` to get metadata (name, mimeType, size, webViewLink).
4. Attempt to download each file using `mcp__google-docs__drive_files_download` with a `savePath` under `.claude/local/devnotes/OCPBUGS/<number>-<Short-Title>/supporting-files/` (create the directory first with `Bash(mkdir -p ...)`).
5. **Read each downloaded text file** (stack traces, logs, error output) and incorporate the content into the issue summary.

**Download fallback:** If `drive_files_download` fails (e.g., temp directory path validation error), present the user with:
- A table of file names, types, sizes, and direct `webViewLink` URLs
- Ask: "I couldn't download these files automatically. Can you paste the text file contents here, or download them and provide the local file paths?"
- Wait for the user to provide the content before proceeding.

**Jira issue links:** The description may contain inline Jira issue cards (e.g., `OCPBUGS-84249`) that get silently dropped during ADF-to-text conversion — appearing as orphaned text like "See" with no link. Use `mcp__jira__jira_get_issue_links` to fetch all linked issues. For each linked issue, fetch its comments and attachments to check for additional supporting files or Drive links.

**Other URLs** (GitHub PRs, Slack threads, external docs): note them in the summary for the user to review.

#### 1d: Validation Gate — Confirm Complete Context

Before proceeding, verify that all reporter-provided information was captured:

1. **Check for reference gaps:** If the description or comments mention "Supporting files", "See", "attached", "screenshot", "stack trace", "Google Drive", "folder", or similar keywords, confirm that corresponding links were found AND their content was retrieved.
2. **If gaps are detected** (references to files but no links found, or links found but retrieval failed):
   - **Stop and ask the user:** "The bug report references supporting files but I couldn't retrieve them. Can you provide the links or paste the content directly?"
   - Do NOT proceed to Step 2 until the user confirms the context is sufficient or provides the missing information.
3. **If no gaps:** present the complete issue summary including:
   - **Title & Summary**
   - **Description** (key points)
   - **Acceptance Criteria** (if any)
   - **Comments** (relevant excerpts)
   - **Supporting files retrieved** (file names, types, key content excerpts)
   - **Other links** (PRs, Slack, docs)

### Step 2: Working Branch Management

1. Determine target branch name: `OCPBUGS-<number>-<Short-Title>`

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
       > Once you're ready, re-run `/start-bug` and I will continue from where we left off."

     - **Do not** perform any `git checkout`, `git stash`, or `git commit` automatically.
     - Stop execution of the skill at this point.
  
4. **If the working tree is clean** (no uncommitted changes):
   - Check if a branch matching `OCPBUGS-<number>-*` already exists.
   - **If the branch already exists:**
     - Inform the user: "Branch `OCPBUGS-<number>-<Short-Title>` already exists."
     - Checkout the existing branch: `git checkout OCPBUGS-<number>-<Short-Title>`
   - **If the branch does not exist:**
     - Ask the user: "What short title should I append to the branch name? (It will be named `OCPBUGS-<number>-<Short-Title>`)"
     - Wait for their response.
     - Detect the correct base branch by running:
       ```
       git remote -v | grep 'openshift/console' | head -1 | awk '{print $1}'
       ```
       This gives the remote name (e.g., `openshift`). Then use `<remote>/main` as the base.
       Fetch before branching: `git fetch <remote> main`
       Create the branch: `git checkout -b OCPBUGS-<number>-<Short-Title> <remote>/main`
**Rule:** Never delete, reset, or overwrite existing branches.

### Step 3: Devnotes Dossier Management

The dossier is a living document updated as work proceeds through investigation, fix, and verification phases.

1. Dossier path = `.claude/local/devnotes/OCPBUGS/<number>-<Short-Title>/DOSSIER.md`
2. **If DOSSIER.md already exists:**
   - Inform the user.
   - Read the full dossier.
   - Analyze and summarize current progress.
3. **If DOSSIER.md does not exist:**
   - Create the directory `.claude/local/devnotes/OCPBUGS/<number>-<Short-Title>/`
   - Copy the content from the template:  
    `.claude/skills/start-bug/DOSSIER-TEMPLATE.md`
   - Populate frontmatter with Jira details (bug number, title, description, acceptance criteria, realated, etc.).

#### Companion Reference Files

Each phase may produce detailed analysis that is too long for the dossier itself. Store these as companion files in the same directory using this naming convention:

```
DOSSIER.md          # Status dashboard + phase summaries (kept concise)
00-Recon.md         # Phase 0: Reconnaissance & State Baseline
01-Isolate.md       # Phase 1: Isolate the Anomaly
02-RCA.md           # Phase 2: Root Cause Analysis
03-Remediation.md   # Phase 3: Remediation
04-Verification.md  # Phase 4: Verification & Regression Guard
05-Audit.md         # Phase 5: Zero-Trust Self-Audit
06-Report.md        # Phase 6: Final Report & Verdict
```

**Rules:**
- The DOSSIER.md phase section should contain a short summary and link to the companion file (e.g., `See [00-Recon.md](00-Recon.md)`).
- Only create a companion file when the phase detail exceeds what fits comfortably in the dossier (~30 lines).
- Ad-hoc reference files can be inserted using letter suffixes (e.g., `01a-Spike-results.md`).

### Step 4: Report Status and Offer Next Action

After successfully handling the branch and dossier:

1. Re-read the current `DOSSIER.md`.
2. Provide a clear status report including:
   - Branch name and status
   - Dossier location
   - Overall status and current phase
   - Progress table (Phase | Status | Last Updated | Summary)

3. Offer context-aware next steps:
   - If early in the process: Ask if they want to start **Phase 0: Reconnaissance & State Baseline**.
   - If already in progress: Ask whether to continue the current phase, re-run a phase, or jump to another.
   - If advanced: Offer to proceed with Self-Audit (Phase 5) or Final Report (Phase 6).

**Core Rules:**
- Always be transparent when items already exist.
- Prefer resuming existing work over starting fresh.
- Keep all files inside `.claude/local/devnotes/` (git-ignored).
- Strictly follow the **OPERATIONAL DOCTRINE**.