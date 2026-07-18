<!-- Author: Alex Chen | Issue: Learning Phase 6 -->

# Database Modeling Guide

## Purpose

This guide explains the Phase 6 database modeling improvements. The goal is to
teach realistic CRUD schema thinking: relationships, ownership, history tables,
indexes, and the tradeoff between simple fields and normalized data.

## What Files To Read

- `packages/server/prisma/schema.prisma`
- `packages/server/prisma/seed.ts`
- `packages/server/src/modules/tickets/ticket.service.ts`
- `packages/server/src/modules/tickets/ticket.repository.ts`
- `docs/learning/refactoring-journal.md`

## What Problem This Pattern Solves

The first schema was intentionally simple. Users and tickets had `teamId` string
fields, and ticket changes were visible only through the broad activity log.

That is enough to build features, but it hides important database lessons:

- Teams should be first-class records, not just repeated strings.
- Organizations group teams in many business systems.
- Assignment and status history are queryable business facts.
- Audit tables answer different questions than a generic activity feed.

## How The Pattern Works In This Repo

The schema now includes:

```text
Organization
  -> Team
    -> User
    -> Ticket

Ticket
  -> TicketStatusHistory
  -> TicketAssignmentHistory
```

`Organization` and `Team` model the company structure. `User.teamId` and
`Ticket.teamId` now reference real `Team` rows.

`TicketStatusHistory` records status transitions with `fromStatus`, `toStatus`,
`changedBy`, and `createdAt`.

`TicketAssignmentHistory` records assignee changes with `fromAssigneeId`,
`toAssigneeId`, `changedBy`, and `createdAt`.

The ticket service writes these history rows when status or assignment changes.

## What Changed

- Added `Organization` and `Team` models.
- Connected users and tickets to teams with Prisma relations.
- Added ticket status and assignment history tables.
- Updated seed data to create an organization and teams before users/tickets.
- Updated ticket repository/service code to write history rows during changes.

## Why It Changed

CRUD apps become more useful when the database represents business concepts
directly. A mid-level engineer should recognize when a string field is enough
for a prototype and when it should become a table with relationships.

## Common Mistakes

- Leaving important concepts as unvalidated strings forever.
- Adding JSON fields for everything because they feel flexible.
- Forgetting indexes on columns used for filtering or history lookups.
- Treating an activity feed as a substitute for structured history tables.
- Changing schema shape without updating seed data.
- Forgetting that migrations need rollback and production data planning.

## Debugging Tips

If seed fails with a foreign-key error, check creation order. Organizations must
exist before teams, teams before users/tickets, and tickets before history rows.

If Prisma TypeScript types do not include a new model, run Prisma generate.

If history rows are missing, trace `ticket.service.ts` and confirm the change
path calls the repository method before returning.

## Review Checklist

- Are relationships represented with foreign keys instead of loose strings?
- Are indexes present for lookup-heavy fields?
- Does seed data respect relationship order?
- Are new history tables written by business logic, not controllers?
- Are schema changes documented with tradeoffs?
- Does the change preserve existing API behavior?

## Follow-Up Exercises

1. Normalize ticket tags into `Tag` and `TicketTag` tables.
2. Add organization scoping to ticket list queries.
3. Write tests that verify status and assignment history rows are created.
4. Add a migration plan for moving existing string `teamId` values into `Team`.
5. Compare generic activity logs with specialized history tables.
