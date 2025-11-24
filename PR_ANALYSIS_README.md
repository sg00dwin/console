# PR Review Pattern Analysis - README

## Overview

This directory contains a comprehensive analysis of human reviewer feedback patterns from 107 merged feature request PRs in the OpenShift Console repository. The analysis identifies the most common code review patterns to help improve automated code review and maintain consistency.

## Documents

### 1. **AGENTS.md** (10KB)
**Purpose**: Actionable guidelines for AI code review agents

**Contents**:
- Critical issues that block merges
- High-priority recommendations
- Console-specific patterns
- Decision framework for review priorities
- Code examples with ❌ BAD / ✅ GOOD patterns

**Best for**: AI agents, automated code reviewers

---

### 2. **PR_REVIEW_PATTERNS_ANALYSIS.md** (17KB)
**Purpose**: Complete detailed analysis with all 75+ patterns

**Contents**:
- Full list of 75+ patterns ranked by frequency
- Detailed breakdown by category
- Real examples from actual PRs
- Methodology and data sources
- Recommendations for different audiences

**Best for**: Deep dive into patterns, understanding rationale

---

### 3. **PR_ANALYSIS_SUMMARY.md** (5KB)
**Purpose**: Quick reference and checklist

**Contents**:
- Top 10 most common patterns
- Critical review blockers
- Category summaries
- Testing checklist
- Quick reference statistics

**Best for**: Quick lookup, pre-review checklist

---

## Key Findings

### Data Overview
- **PRs Analyzed**: 107 CONSOLE-* feature requests
- **Time Period**: Last 300 merged PRs (~3-4 months)
- **Human Comments**: 1,855 (excluding bots)
- **Actionable Feedback**: 1,285 comments (69% of human comments)
- **Unique Patterns**: 75+ specific, repeatable patterns

### Top 5 Most Common Patterns

1. **[140 occurrences]** Add required labels (px-approved, docs-approved, qe-approved)
2. **[123 occurrences]** Create follow-up stories for deferred work
3. **[31 occurrences]** Use object spread (...) instead of Object.assign()
4. **[31 occurrences]** Add "No results found" text for empty states
5. **[25 occurrences]** Follow naming conventions and maintain consistency

### Critical Review Blockers

These issues MUST be fixed before merge:

1. **i18n violations** - Missing translation updates
2. **TypeScript errors** - Type safety issues
3. **Circular dependencies** - Import cycle problems
4. **Missing labels** - Required approval labels
5. **Test failures** - CI must pass

## Usage Guide

### For AI Code Review Agents

1. Start with **AGENTS.md** - it's structured for automated review
2. Use pattern frequency as confidence score:
   - Count > 10: High-confidence rules
   - Count 5-10: Strong suggestions
   - Count < 5: Context-dependent recommendations
3. Follow the decision framework for blocking vs. suggesting changes

### For Human Reviewers

1. Use **PR_ANALYSIS_SUMMARY.md** as a pre-review checklist
2. Reference **PR_REVIEW_PATTERNS_ANALYSIS.md** for detailed rationale
3. Cite pattern numbers when giving feedback (e.g., "Pattern #14: Use PatternFly components")

### For Contributors

1. Review **PR_ANALYSIS_SUMMARY.md** before submitting PR
2. Self-review against top 30 patterns
3. Run automated checks:
   ```bash
   yarn check-cycles
   yarn i18n
   yarn dev
   ./clean-frontend.sh && ./build-frontend.sh
   ```

## Pattern Categories

| Category | Occurrences | Top Pattern |
|----------|-------------|-------------|
| Git/PR Process | 312 | Add required labels (140) |
| Documentation | 404 | Add JSDoc comments (280) |
| Code Quality | 194 | Use object spread (31) |
| UI/UX | 62 | Add "No results found" (31) |
| Testing | 32 | Migrate to RTL (13) |
| Code Architecture | 28 | Fix circular deps (17) |
| Performance | 23 | Optimize re-renders (14) |
| React Patterns | 16 | Use useMemo/useCallback (12) |
| Accessibility | 16 | Add role attributes (12) |
| i18n | 10 | Use useTranslation (6) |
| TypeScript | 9 | Avoid 'any' type (4) |
| Error Handling | 5 | Validate edge cases (3) |

## Methodology

### Data Collection
1. Fetched 300 most recent merged PRs using GitHub CLI
2. Filtered for CONSOLE-* feature requests (107 PRs)
3. Extracted PR comments and inline code review comments
4. Filtered out bot comments (coderabbitai, openshift-ci-robot, etc.)
5. Identified actionable feedback (excluded "LGTM", "thanks", etc.)

### Pattern Extraction
1. Categorized feedback into 15 major categories
2. Extracted specific, repeatable patterns with examples
3. Counted pattern frequency across all PRs
4. Ranked patterns by occurrence count
5. Validated against actual PR comments

### Quality Assurance
- Manual review of sample PRs to verify pattern accuracy
- Cross-referenced patterns across multiple reviewers
- Validated that patterns represent consensus, not individual preferences
- Checked that patterns are actionable and specific

## Contributing Reviewers

Patterns extracted from feedback by experienced maintainers:
- @logonoff
- @rhamilto
- @yapei
- @vikram-raj
- @TheRealJon
- @vojtechszocs
- @sg00dwin
- @cajieh
- @XiyunZhao
- @yanpzhan
- And many others

## Updating the Analysis

### When to Update
- After every 100 CONSOLE-* PRs merge
- When major changes to review standards occur
- Quarterly review recommended

### How to Update
1. Run analysis script on new PR batch
2. Compare pattern frequencies with previous analysis
3. Add new patterns with count > 5
4. Update priority scores
5. Archive patterns that no longer appear frequently

### Update Script
The analysis can be re-run using:
```bash
# Fetch recent PRs
gh pr list --repo openshift/console --state merged --limit 300 --json number,title,labels

# Filter and analyze (see detailed methodology in PR_REVIEW_PATTERNS_ANALYSIS.md)
```

## Data Files

Raw data from this analysis is available in `/tmp/`:
- `pr_review_data.json` - PR comments and reviews
- `pr_inline_comments.json` - Inline code review comments
- `analysis_results.json` - Processed analysis data
- `specific_patterns.json` - Extracted pattern details

## License

This analysis is for internal use within the OpenShift Console project. The patterns represent community feedback and are shared to improve code quality.

## Questions or Feedback

If you have questions about these patterns or suggestions for improvement:
1. Open an issue in the console repository
2. Reference this analysis in your PR discussions
3. Suggest new patterns based on emerging trends

---

**Last Updated**: November 21, 2025
**Analysis Period**: Last 300 merged PRs (approximately 3-4 months)
**Next Review**: After 100 more CONSOLE-* PRs merge
