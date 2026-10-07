<!-- Author: Morgan Lee | Issue: Learning Phase 7 -->

# Testing Strategy Guide

## Purpose

This guide explains how to think about tests in this HelpDesk repo. The goal is
not maximum test count. The goal is useful confidence for a CRUD app that is
being refactored in realistic phases.

## What Files To Read

- `tests/unit/ticketService.test.ts`
- `tests/unit/authService.test.ts`
- `tests/unit/statusMachine.test.ts`
- `tests/unit/commentService.test.ts`
- `tests/integration/validation.test.ts`
- `tests/integration/authz.test.ts`
- `tests/integration/statusTransitions.test.ts`

Also in the suite but not listed above: `tests/integration/tickets.test.ts` (a
health-check smoke test), `tests/unit/dashboardService.test.ts`,
`packages/server/src/modules/tickets/ticket.test.ts` (mapper and permission
helpers), and the unit tests added by the enterprise sprints
(`attachmentService`, `knowledgeBaseService`, `notificationService`,
`outboxService`, `sanitizeHtml`, `slaService` and `userService`). That's 17
files and 45 `it(...)` cases in total as of 2026-10-06
(`grep -c "it(" tests/*/*.ts packages/server/src/modules/tickets/ticket.test.ts`).
`npm test` runs them all through the server workspace's `vitest run --root ../..`
script.

## What Problem This Pattern Solves

Refactors are safer when tests protect behavior rather than implementation
details. Phase 7 adds coverage for auth boundaries and ticket history side
effects because those are easy to break while improving architecture.

## How The Pattern Works In This Repo

Unit tests focus on business logic and pure helpers:

- status-machine transitions
- auth password verification and session creation
- comment visibility rules
- ticket service behavior

Integration tests focus on HTTP boundaries:

- validation failures
- unauthenticated protected routes

Two caveats a reviewer should notice. First, despite its folder,
`tests/integration/statusTransitions.test.ts` never goes through HTTP: it calls
`createTicketService` with hand-built `vi.fn()` mocks, so it's a service
test. Second, no test sends a request *as a logged-in user*. Apart from the
health check, every `supertest` call in `tests/integration/` either fails
validation (`400`) or has no token (`401`). Nothing covers `403`, ownership, or
what a successful response contains, which is why the gaps in
[security-mistakes-in-crud-apps.md](security-mistakes-in-crud-apps.md#known-gaps-in-this-repo)
went unnoticed.

## What Changed

- Added authorization integration tests for protected endpoints.
- Expanded ticket service coverage to verify structured status history writes.
- Documented what to test at each layer and why.

## Why It Changed

The project now has validation, auth, RBAC, module boundaries, and database
history tables. Tests need to protect those learning-critical rules so future
refactors can move faster without fear.

## Common Mistakes

- Testing private implementation details instead of observable behavior.
- Mocking so much that the test no longer represents the real feature.
- Only testing happy paths.
- Skipping authorization failure tests.
- Writing brittle frontend tests that fail whenever text moves.
- Treating 100 percent coverage as the goal instead of useful feedback.

## Debugging Tips

When a unit test fails, ask whether the business rule changed or the mock no
longer matches the dependency contract.

When an integration test fails, read the response body first. This API returns
structured errors with `error.code`, which usually tells you where to look.

If a test fails after a Prisma schema change, regenerate Prisma Client and check
mock objects for new repository methods.

## Review Checklist

- Does the test cover an important behavior or just a line of code?
- Does the test name explain the rule being protected?
- Are failure cases included?
- Are auth and validation tested at the HTTP boundary?
- Are business rules tested close to the service/helper that owns them?
- Would this test catch a real regression during refactoring?

## Follow-Up Exercises

1. Add a login integration test backed by a test database.
   **Check:** it logs in as `riley.requester@example.com` from
   `packages/server/prisma/seed.ts`, uses the token on `GET /api/users`, and
   asserts no `passwordHash` in the body. That test should fail today.
2. **Find a test that can't fail.**
   *Goal:* practise reading tests for what they prove.
   **Check:** for each `it(...)` in `tests/integration/validation.test.ts`, write
   the one-line production change that would make it fail. If you can't find
   one for a test, explain why it still earns its place.
3. Add tests for assignment history creation.
4. Add frontend tests for login redirect behavior.
5. Add Playwright coverage for login, ticket creation, and comment creation.
6. Write a test plan before refactoring comments into a module.
