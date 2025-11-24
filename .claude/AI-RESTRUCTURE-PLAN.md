# AI File Structure Evaluation & Implementation Plan

**DECISION: Proceeding with Recommended 3-File Structure**

## Current State Analysis

**Existing Structure:**
- `.ai/context.md` - Single comprehensive file (~173 lines)
- `.ai/README.md` - Brief explanation
- `CLAUDE.md` - Points to .ai/context.md
- `.cursor/context.md` - Points to .ai/context.md
- `.claude/settings.local.json` - Personal settings (gitignored)

**Content in current context.md:**
- Project structure & overview
- Console Dynamic Plugin SDK (critical public API)
- Frontend: commands, conventions, patterns, testing
- Backend: commands, conventions, testing
- Global practices: commits, branches

## Proposed Structure Evaluation

### STRENGTHS
1. **Industry alignment** - AGENTS.md follows emerging standard (agents.md)
2. **Separation of concerns** - Splits monolithic context.md into focused files
3. **Multi-AI support** - Tool-agnostic .ai/ directory
4. **Team config** - Checked-in settings.json for shared defaults

### IDENTIFIED ISSUES

#### Issue 1: Content Organization Ambiguity
**Problem:** Proposed split creates potential overlap/confusion:
- CODING_STANDARDS.md vs ARCHITECTURE-PATTERNS.md (where do conventions go?)
- TECHNOLOGY-STACK-AND-USAGE.md duplicates info in ARCHITECTURE
- UNIT-TESTING.md too narrow (what about integration/E2E tests?)

**Impact:** AI agents may not know which file to check for specific info

#### Issue 2: AGENTS.md Content Unclear
**Problem:** Proposed structure shows AGENTS.md as "Central AI hub" but doesn't specify what content it contains vs .ai/ files

**Impact:** Risk of duplicating content between AGENTS.md and .ai/ files, or having AGENTS.md as just a pointer (defeats the agents.md standard purpose)

#### Issue 3: Missing Migration for .cursor/context.md
**Problem:** Proposed structure doesn't show what happens to .cursor/context.md

**Impact:** Cursor users may have broken references

#### Issue 4: Too Many Small Files
**Problem:** 4+ separate files in .ai/ may be over-fragmented for a single project
**Impact:** Harder to maintain, find information, keep in sync

## RECOMMENDED STRUCTURE

### Simplified, Comprehensive Approach

```
console/
├── AGENTS.md                          # ✅ Main AI hub (actual content)
├── CLAUDE.md                          # 🔄 Points to AGENTS.md
├── .cursor/context.md                 # 🔄 Points to AGENTS.md
├── .ai/                               # Detailed reference docs
│   ├── README.md                      # ✅ Explains .ai/ structure
│   ├── ARCHITECTURE.md                # ✅ System architecture, Plugin SDK, stack
│   ├── CONVENTIONS.md                 # ✅ Coding standards, patterns, file naming
│   └── TESTING.md                     # ✅ All testing (unit, integration, E2E)
├── .claude/
│   ├── settings.json                  # ✅ Team config (checked in)
│   ├── settings.local.json            # ✔️ Personal overrides (gitignored)
│   ├── commands/                      # ✔️ Shared slash commands
│   └── local/                         # ✔️ Personal files (gitignored)
├── .cursor/                           # ✔️ Cursor-specific configs
└── [Other root docs unchanged]
```

### Content Distribution

#### AGENTS.md (~150-200 lines)
**Purpose:** Main entry point for ALL AI coding agents
**Contains:**
- Project overview (monorepo structure, key areas)
- Quick start commands (build, test, dev server)
- Development workflow (branch naming, commit strategy)
- Key gotchas (Plugin SDK breaking changes, i18n workflow)
- Links to detailed docs in .ai/

**Why:** Follows agents.md standard - provides immediate, actionable context

#### .ai/ARCHITECTURE.md
**Purpose:** System design and structure
**Contains:**
- **Monorepo package structure** (frontend/, pkg/, cmd/)
- **Technology stack overview:**
  - Frontend: React, TypeScript, yarn workspaces, Webpack Module Federation
  - Backend: Go, klog, Kubernetes client libraries
  - Deployment: OpenShift/Kubernetes
  - Build tools: yarn, Go toolchain
- **Console Dynamic Plugin SDK architecture**
  - Extension points system (25+ types)
  - Module Federation runtime loading
  - Type system and code references
  - Public API surface (re-exports from @console/shared, @console/internal, etc.)
- **Plugin structure patterns**
- **Key architectural decisions** (why Module Federation, monorepo rationale)
- **Package relationships and dependencies**

#### .ai/CONVENTIONS.md
**Purpose:** Code style and standards
**Contains:**
- **TypeScript/React conventions**
  - Functional components and hooks
  - State management patterns (Context API, migrating from Redux)
  - Component structure and file organization
- **Framework usage patterns:**
  - PatternFly design system usage
  - React hooks best practices (useK8sWatchResource, etc.)
  - i18n with useTranslation hook
- **Go best practices**
  - Package organization patterns
  - Error handling standards
  - Logging conventions (klog)
  - HTTP handler patterns
- **File naming conventions** (PascalCase, kebab-case rules)
- **API call patterns** (consoleFetchJSON, k8s resource hooks)
- **Styling conventions** (SCSS modules, PatternFly integration)
- **Error handling patterns**

#### .ai/TESTING.md
**Purpose:** All testing approaches
**Contains:**
- Unit testing patterns (Jest)
- Integration testing
- E2E testing (Cypress)
- Test organization
- Coverage expectations

#### .ai/README.md
**Purpose:** Explain the .ai/ directory structure
**Contains:**
- What each file contains
- When to update which file
- Relationship to AGENTS.md

### Tool-Specific Files

#### CLAUDE.md
```markdown
# Claude Code Configuration

This project uses AGENTS.md as the central AI hub.

See [AGENTS.md](./AGENTS.md) for:
- Project overview and structure
- Development commands and workflow
- Key conventions and gotchas

For detailed documentation, see [.ai/](./.ai/) directory.

## Claude-Specific Notes
- Team permissions configured in `.claude/settings.json`
- Personal overrides in `.claude/settings.local.json`
```

#### .cursor/context.md
```markdown
# Cursor AI Configuration

This project uses AGENTS.md as the central AI hub.

See [AGENTS.md](../AGENTS.md) for:
- Project overview and structure
- Development commands and workflow
- Key conventions and gotchas

For detailed documentation, see [../.ai/](../.ai/) directory.
```

## CONTENT MAPPING: PROPOSED vs RECOMMENDED

### Where TECHNOLOGY-STACK-AND-USAGE.md Content Goes

**In your proposed structure, this file would contain:**
- List of technologies (React, TypeScript, Go, Kubernetes, etc.)
- How each technology is used in the project
- Version requirements
- Build tools and workflows

**In recommended structure, this distributes to:**

1. **AGENTS.md** - Quick reference:
   ```markdown
   ## Tech Stack at a Glance
   - Frontend: React + TypeScript (yarn workspaces)
   - Backend: Go
   - Platform: OpenShift/Kubernetes
   ```

2. **.ai/ARCHITECTURE.md** - Detailed tech architecture:
   - Full technology stack with rationale
   - Webpack Module Federation architecture
   - How technologies integrate (React → Plugin SDK → Module Federation)
   - Package.json dependencies and why they exist
   - Go package structure and tooling

3. **.ai/CONVENTIONS.md** - How to USE the technologies:
   - React/TypeScript coding patterns
   - PatternFly component usage
   - Go idioms and standards
   - Which libraries to use for what (e.g., "use consoleFetchJSON for HTTP")

**Why this is better:** Avoids duplicating "what tech" (ARCHITECTURE) from "how to use tech" (CONVENTIONS). Stack information appears where developers need it contextually.

### Full Content Mapping from context.md

| Current context.md Section | Proposed Structure | Recommended Structure |
|----------------------------|-------------------|----------------------|
| Project Overview | AGENTS.md | AGENTS.md |
| Key Packages & Areas | TECHNOLOGY-STACK-AND-USAGE | ARCHITECTURE.md |
| Console Dynamic Plugin SDK | ARCHITECTURE-PATTERNS | ARCHITECTURE.md |
| Frontend Commands | AGENTS.md | AGENTS.md |
| Frontend Conventions | CODING_STANDARDS | CONVENTIONS.md |
| Frontend Patterns | ARCHITECTURE-PATTERNS | CONVENTIONS.md (how to use) + ARCHITECTURE.md (system design) |
| Frontend Testing | UNIT-TESTING | TESTING.md |
| Backend Commands | AGENTS.md | AGENTS.md |
| Backend Conventions | CODING_STANDARDS | CONVENTIONS.md |
| Backend Testing | UNIT-TESTING | TESTING.md |
| Commit Strategy | AGENTS.md | AGENTS.md |
| Branch Naming | AGENTS.md | AGENTS.md |

## COMPARISON TO PROPOSED STRUCTURE

| Aspect | Proposed | Recommended | Rationale |
|--------|----------|-------------|-----------|
| # of .ai/ files | 5 (README + 4 content) | 4 (README + 3 content) | Simpler without losing comprehensiveness |
| AGENTS.md role | Unclear | Main AI hub with content | Follows agents.md standard |
| Tech stack info | Separate file | In ARCHITECTURE.md | Reduces redundancy |
| Standards vs Patterns | 2 files | 1 CONVENTIONS.md | Eliminates ambiguity |
| Testing scope | Unit only | All testing | More comprehensive |
| .cursor handling | Not specified | Points to AGENTS.md | Consistent with other tools |

## MIGRATION APPROACH

### Phase 1: Create New Structure
1. Create AGENTS.md with core content from context.md
2. Create .ai/ARCHITECTURE.md (architecture + stack)
3. Create .ai/CONVENTIONS.md (standards + patterns)
4. Create .ai/TESTING.md (all testing approaches)
5. Update .ai/README.md

### Phase 2: Update Pointers
6. Update CLAUDE.md to point to AGENTS.md
7. Update .cursor/context.md to point to AGENTS.md

### Phase 3: Team Config
8. Create .claude/settings.json from settings.local.json as template
9. Update .gitignore if needed

### Phase 4: Cleanup
10. Delete .ai/context.md
11. Verify all references work

## IMPLEMENTATION CHECKLIST

### Files to CREATE
- [ ] `/Users/sgoodwin/Git/console/AGENTS.md`
- [ ] `/Users/sgoodwin/Git/console/.ai/ARCHITECTURE.md`
- [ ] `/Users/sgoodwin/Git/console/.ai/CONVENTIONS.md`
- [ ] `/Users/sgoodwin/Git/console/.ai/TESTING.md`
- [ ] `/Users/sgoodwin/Git/console/.claude/settings.json`

### Files to UPDATE
- [ ] `/Users/sgoodwin/Git/console/.ai/README.md`
- [ ] `/Users/sgoodwin/Git/console/CLAUDE.md`
- [ ] `/Users/sgoodwin/Git/console/.cursor/context.md`
- [ ] `/Users/sgoodwin/Git/console/.gitignore` (if needed for .claude/settings.json)

### Files to DELETE
- [ ] `/Users/sgoodwin/Git/console/.ai/context.md`

### Post-Implementation Validation
- [ ] Verify all links work correctly
- [ ] Test that Claude Code picks up new structure
- [ ] Test that Cursor picks up new structure
- [ ] Ensure .claude/settings.json has reasonable defaults

## CRITICAL FILES TO MODIFY

1. `/Users/sgoodwin/Git/console/AGENTS.md` - CREATE
2. `/Users/sgoodwin/Git/console/.ai/ARCHITECTURE.md` - CREATE
3. `/Users/sgoodwin/Git/console/.ai/CONVENTIONS.md` - CREATE
4. `/Users/sgoodwin/Git/console/.ai/TESTING.md` - CREATE
5. `/Users/sgoodwin/Git/console/.ai/README.md` - UPDATE
6. `/Users/sgoodwin/Git/console/CLAUDE.md` - UPDATE
7. `/Users/sgoodwin/Git/console/.cursor/context.md` - UPDATE
8. `/Users/sgoodwin/Git/console/.claude/settings.json` - CREATE
9. `/Users/sgoodwin/Git/console/.ai/context.md` - DELETE

## RISKS & MITIGATIONS

**Risk 1:** AI agents trained on old structure may still look for CLAUDE.md content
- **Mitigation:** Keep CLAUDE.md with clear pointer to AGENTS.md

**Risk 2:** Content might not fit cleanly into 3 categories
- **Mitigation:** Use "Global Practices" section in AGENTS.md for cross-cutting concerns

**Risk 3:** Team may not maintain multiple files
- **Mitigation:** Document in .ai/README.md which file to update for what
