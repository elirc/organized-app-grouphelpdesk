<!-- Author: Morgan Lee | Issue: Learning Phase 4 -->

# Auth And RBAC Guide

## Purpose

This guide explains the authentication and role-based authorization added in
Phase 4. The goal is to teach a realistic CRUD-app security boundary: the server
must derive the current user from the request, not trust user IDs or roles sent
by the client.

## What Files To Read

- `packages/server/src/routes/auth.ts`
- `packages/server/src/controllers/authController.ts`
- `packages/server/src/services/authService.ts`
- `packages/server/src/middleware/auth.ts`
- `packages/server/src/utils/password.ts`
- `packages/server/src/modules/tickets/ticket.routes.ts`
- `packages/server/src/modules/tickets/ticket.controller.ts`
- `packages/client/src/auth/AuthProvider.tsx`
- `packages/client/src/auth/ProtectedRoute.tsx`
- `packages/client/src/pages/LoginPage.tsx`
- `packages/client/src/services/api.ts`

## What Problem This Pattern Solves

Before this phase, the API accepted fields like `createdBy`, `authorId`,
`actorId`, and `viewerRole` from the browser. That is useful for scaffolding, but
unsafe as a real system design.

The problem is simple: a browser request is not trustworthy. A user can open dev
tools and send any JSON they want.

Phase 4 changes the direction of trust:

```text
client sends credentials -> server verifies credentials -> server issues token
client sends token -> server derives current user -> services use current user
```

## How The Pattern Works In This Repo

Login uses `POST /api/auth/login`. The auth service finds the user by email,
verifies the password with `scrypt`, creates an opaque session token, and returns
the token plus a safe user object.

The frontend stores that token in `localStorage` and sends it as:

```text
Authorization: Bearer <token>
```

`optionalAuth` reads the header, looks up the session, and attaches
`req.currentUser`. Protected routes use `requireAuth` or `requireRole`.

The ticket controller now creates tickets with:

```ts
createdBy: req.currentUser!.id;
```

That is the key learning point. The client may still send `createdBy`, but the
server ignores it for authenticated routes.

## What Changed

- Added password hashing with Node's `crypto.scrypt`.
- Added login, logout, and current-user endpoints.
- Added auth middleware and role middleware.
- Added `passwordHash` to the Prisma `User` model.
- Updated seed data with learning accounts and passwords.
- Protected ticket, comment, user, dashboard, and write-side knowledge base
  routes.
- Updated frontend API requests to send bearer tokens.
- Added frontend auth context, login page, and protected routes.

## Why It Changed

This phase teaches the difference between authentication and authorization.

Authentication answers: "Who is making this request?"

Authorization answers: "Is this user allowed to do this action?"

A mid-level engineer should recognize that frontend route guards are useful for
user experience, but backend authorization is the real security boundary.

## Common Mistakes

- Trusting `createdBy`, `authorId`, or `viewerRole` from the request body.
- Hiding UI buttons and assuming the API is protected.
- Returning `passwordHash` in login or user responses.
- Revealing whether the email or password was wrong during login.
- Adding role checks only in controllers while services still accept unsafe
  actor IDs.
- Treating localStorage tokens as perfectly secure. They are convenient for this
  learning app, but have XSS tradeoffs.

## Debugging Tips

If a request returns `401`, check whether the `Authorization` header is present
and whether the frontend token exists in localStorage.

If a request returns `403`, the user is logged in but does not have one of the
required roles for that route.

If login fails after reseeding, confirm the seeded password examples in
`LoginPage.tsx` match the values in `packages/server/prisma/seed.ts`.

If TypeScript says `passwordHash` does not exist on `User`, regenerate Prisma
Client after changing `schema.prisma`.

## Review Checklist

- Does the server derive the current user from auth middleware?
- Are sensitive routes protected with `requireAuth` or `requireRole`?
- Are role checks server-side, not only frontend-side?
- Are password hashes stored instead of plaintext passwords?
- Does login return a safe user object?
- Are tests checking both success and failure paths?
- Is any old client-provided identity field still trusted?

## Follow-Up Exercises

1. Replace in-memory sessions with a database-backed session table.
2. Add token expiration and session revocation.
3. Add an integration test that logs in and creates a ticket as a customer.
4. Add `canViewTicket(currentUser, ticket)` to the ticket permissions file.
5. Compare opaque sessions with JWTs and write an ADR for the choice.
