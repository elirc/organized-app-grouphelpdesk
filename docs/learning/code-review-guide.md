<!-- Author: Morgan Lee | Issue: Learning Phase 8 -->

# Code Review Guide

## Purpose

This guide explains how to review HelpDesk pull requests like a growing
mid-level engineer: behavior first, architecture second, style last.

## What Files To Read

- `CONTRIBUTING.md`
- `docs/learning/improvement-plan.md`
- `docs/learning/current-architecture-review.md`
- `packages/server/src/modules/tickets/`
- `packages/client/src/hooks/`
- `tests/`

## What Problem This Pattern Solves

Code review is not just finding typos. It is how teams protect behavior,
architecture, maintainability, and shared understanding.

## How The Pattern Works In This Repo

Review each PR in passes:

1. Behavior: does it do what the issue says?
2. Safety: does it preserve auth, validation, and data rules?
3. Architecture: is the code in the right layer?
4. Tests: would a regression be caught?
5. Learning: does the change teach the intended skill?
6. Style: naming, formatting, and small readability issues.

## What Changed

Phase 8 adds an explicit review guide so the repo can be used for practicing
realistic review conversations, not only coding.

## Why It Changed

Mid-level engineers are expected to review code for risk. They should notice
trust-boundary mistakes, hidden data coupling, missing invalidation, weak tests,
and unclear ownership.

## Common Mistakes

- Reviewing only formatting.
- Suggesting personal preference as if it were correctness.
- Missing authorization problems because the UI "looks right."
- Asking for a huge rewrite instead of a safe follow-up.
- Failing to explain why a requested change matters.

## Debugging Tips

When reviewing a suspicious change, trace one real request through the code.

If a PR changes a schema, inspect seed data and tests.

If a PR changes a mutation, inspect query invalidation.

If a PR changes auth, ask what happens when the client lies.

## Review Checklist

- Is the behavior clear from the PR description?
- Are request inputs validated at the boundary?
- Is identity derived from auth, not client-provided fields?
- Are business rules in services?
- Are Prisma calls isolated to repositories or data services?
- Are tests meaningful?
- Is documentation updated when patterns change?

## Follow-Up Exercises

1. Review the ticket module refactor commit.
2. Review the auth commit and identify remaining security debt.
3. Review a TanStack Query hook for stale-data risks.
4. Write three comments: one blocking, one suggestion, one praise.
5. Practice turning a vague review comment into a specific one.
