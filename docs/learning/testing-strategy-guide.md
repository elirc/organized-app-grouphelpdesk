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
- status transition behavior through the API

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
2. Add tests for assignment history creation.
3. Add frontend tests for login redirect behavior.
4. Add Playwright coverage for login, ticket creation, and comment creation.
5. Write a test plan before refactoring comments into a module.
