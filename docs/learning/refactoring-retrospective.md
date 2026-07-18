<!-- Author: Morgan Lee | Issue: Learning Phase 8 -->

# Refactoring Retrospective

## Purpose

This retrospective summarizes what improved, what remains incomplete, and where
the next learning PRs should go.

## What Files To Read

- `docs/learning/refactoring-journal.md`
- `docs/learning/improvement-plan.md`
- `docs/learning/mid-level-swe-skills-map.md`

## What Worked Well

The project improved in reviewable phases. Each phase had a focused teaching
goal and left documentation behind.

The strongest improvements were runtime validation, server-derived identity,
ticket module boundaries, query caching, and database history modeling.

## What Remains Incomplete

The comments, dashboard, users, and knowledge-base domains have not yet been
modularized like tickets.

Auth uses in-memory sessions and localStorage tokens. That is acceptable for
learning but not production-ready.

Organization scoping exists in the schema but is not enforced across every
query.

Frontend tests are still missing.

Tag modeling is still denormalized.

## What Skills Grew

- Reading an unfamiliar codebase before changing it.
- Separating validation, controller, service, repository, and mapper concerns.
- Identifying trust boundaries.
- Refactoring incrementally.
- Adding tests around behavior and risk.
- Writing documentation that explains decisions.

## What Felt Unrealistic

A real team would split these changes across many PRs and reviewers. A real
production auth system would require more threat modeling. A real database
migration would need data migration scripts, backups, and rollback plans.

## Future Improvements

- Database-backed sessions with expiration.
- Organization-scoped RBAC.
- Comments module refactor.
- Normalized tags.
- Frontend tests with React Testing Library.
- Playwright smoke tests.
- Production migration workflow.

## Follow-Up Exercises

1. Pick one unresolved debt item and write a one-page implementation plan.
2. Review the auth phase as if it were someone else's PR.
3. Add one failing test before the next refactor.
4. Create a diagram for organization-scoped permissions.
5. Explain the project in an interview-style architecture walkthrough.
