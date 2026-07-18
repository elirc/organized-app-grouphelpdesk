<!-- Author: Morgan Lee | Issue: Learning Phase 8 -->

# Senior Engineering Decisions

## Purpose

This document records the tradeoffs made during the improvement phases. It is
written so a learner can see that senior engineering is not magic. It is mostly
sequencing, risk management, and honest tradeoff naming.

## What Files To Read

- `docs/learning/refactoring-journal.md`
- `docs/learning/improvement-plan.md`
- `docs/learning/auth-and-rbac-guide.md`
- `docs/learning/database-modeling-guide.md`
- `packages/server/src/modules/tickets/`

## What Problem This Pattern Solves

The repo could have been rewritten from scratch. That would be faster for a
demo, but worse for learning realistic engineering.

The chosen path was incremental:

```text
document -> validate -> modularize tickets -> add auth -> improve state -> improve schema -> expand tests
```

## How The Pattern Works In This Repo

Each phase left the app in a working state and added documentation. That mirrors
real teams: small PRs, clear intent, tests, and follow-up debt.

## What Changed

The project now has a stronger learning spine:

- clear reading guides
- runtime validation
- module-based ticket architecture
- auth and RBAC
- TanStack Query server state
- more realistic database modeling
- stronger tests
- debugging and review guidance

## Why It Changed

The project is designed to grow a junior/intermediate engineer toward mid-level
CRUD skills. That means prioritizing practical patterns over flashy features.

## Common Mistakes

- Optimizing for perfect architecture before the learner understands the current
  architecture.
- Rewriting every domain after proving a pattern in one domain.
- Adding auth UI but leaving backend routes unprotected.
- Adding database tables without service behavior.
- Treating documentation as a final chore instead of part of the design.

## Debugging Tips

When a future change feels hard, ask whether the problem is:

- unclear ownership
- missing validation
- missing permission checks
- stale frontend cache
- weak database model
- insufficient tests

That usually points to the next safe refactor.

## Review Checklist

- Was the phase small enough to review?
- Did the change improve learning value?
- Did it preserve working behavior?
- Did it document tradeoffs?
- Did it create a clear next step?

## Follow-Up Exercises

1. Write an ADR for session storage.
2. Plan a comments module refactor without implementing it.
3. Design organization-scoped ticket permissions.
4. Compare this repo's architecture to a production support app.
5. Identify three pieces of technical debt worth keeping for learning.
