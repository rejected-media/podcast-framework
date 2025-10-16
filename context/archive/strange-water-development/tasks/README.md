# Tasks Directory Organization

This directory contains task-related documentation organized by status.

## Structure

```
context/tasks/
├── active/          # Current tasks and active plans
├── completed/       # Finished tasks (for reference)
├── research/        # Investigation results
└── README.md        # This file
```

## Guidelines

### active/
Place documents for tasks that are:
- Currently being worked on
- Planned for immediate future (next 1-2 sessions)
- Awaiting user decision

**Examples:** Feature proposals, roadmap evaluations, active planning documents

### completed/
Move documents here when tasks are:
- Fully implemented
- Deployed to production
- No longer need active reference

**Note:** Consider archiving to `context/archive/` if completed >3 months ago and no longer referenced.

**Examples:** Migration guides (post-migration), implementation plans (post-completion), setup guides (post-setup)

### research/
Place documents for:
- Technology investigations
- Integration research
- Feasibility studies
- Data analysis

**Examples:** API research, hosting provider comparisons, automation notes

## Maintenance

**Monthly:**
- Review `active/` for completed items → move to `completed/`
- Review `completed/` for old items (>3 months) → archive to `context/archive/`
- Clean up obsolete research documents

**Session-end:**
- Move completed task docs from `active/` to `completed/`
- Update task status in STATUS.md

## Current Contents

**Active (3 files):**
- newsletter-plan.md - Newsletter implementation planning
- roadmap-evaluation.md - Pre-templatization feature analysis
- requests-proposal.md - Community requests feature proposal

**Completed (4 files):**
- CLOUDFLARE_DEPLOYMENT.md - Cloudflare Pages migration guide
- cloudflare-migration-guide.md - Migration checklist
- CONTRIBUTION_FEATURE_SETUP.md - Contribution feature implementation
- framework-generalization-plan.md - Framework templatization plan
- hosting-migration-analysis.md - Hosting provider analysis

**Research (2 files):**
- AUTOMATION_NOTES.md - Episode artwork automation research
- pods-media-integration-research.md - Pods.media integration investigation

---

**Last Updated:** 2025-10-14 (Session 20 - documentation cleanup)
