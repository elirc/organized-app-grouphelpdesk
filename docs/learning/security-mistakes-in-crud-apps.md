<!-- Author: Morgan Lee | Issue: Learning Phase 4 -->

# Security Mistakes In CRUD Apps

## Purpose

This guide names the security mistakes this HelpDesk project is designed to
teach. It is practical on purpose: these are the mistakes junior and
intermediate engineers actually make in CRUD apps.

## What Files To Read

- `packages/server/src/middleware/auth.ts`
- `packages/server/src/controllers/commentController.ts`
- `packages/server/src/modules/tickets/ticket.controller.ts`
- `packages/server/src/routes/dashboard.ts`
- `packages/client/src/auth/ProtectedRoute.tsx`

## What Problem This Pattern Solves

CRUD apps feel safe because the UI looks controlled. But HTTP APIs are public
interfaces. If the backend trusts the browser too much, a user can bypass the UI
and send unauthorized requests directly.

## How The Pattern Works In This Repo

The frontend can protect routes for usability. For example, `ProtectedRoute`
redirects anonymous users to `/login`.

The backend protects data. For example, dashboard routes use:

```ts
dashboardRouter.use(requireRole(UserRole.AGENT, UserRole.ADMIN));
```

That means a customer cannot view dashboard metrics by manually calling
`/api/dashboard/metrics`.

## What Changed

The server no longer relies on the browser to identify the creator of tickets,
author of comments, actor for assignments, or viewer role for internal notes.

The frontend still sends normal form data, but identity-sensitive values now
come from `req.currentUser`.

## Why It Changed

Security is mostly about trust boundaries. A mid-level engineer should ask:

- Who provided this value?
- Can the user modify it?
- What happens if they lie?
- Where is the server enforcing the rule?

Those questions matter more than memorizing a specific auth library.

## Common Mistakes

- "The button is hidden, so the user cannot do it."
- "The TypeScript type says this is an admin."
- "The request body includes the user's ID, so it must be their ID."
- "The frontend route is protected, so the backend route can be open."
- "This is just an internal tool, so auth does not matter."

## Debugging Tips

Use the browser network tab to inspect whether the `Authorization` header is
being sent.

Use API tools or curl to call a protected endpoint without a token. You should
see `401`.

Call an admin endpoint with a customer token. You should see `403`.

When debugging internal notes, trace from `CommentForm` to `api.comments.create`
to `commentController`. The important question is whether the server checks the
current user's role before allowing internal content.

## Review Checklist

- Are all privileged routes protected server-side?
- Are role decisions centralized enough to review?
- Are error messages helpful without leaking sensitive details?
- Are tests covering unauthorized and forbidden cases?
- Are docs honest about remaining limitations?

## Known Gaps In This Repo

Verified against the code in this snapshot on 2026-10-06. Each one is a mistake
from the list above that the repo still makes. Paths are relative to
`packages/server/src/`.

1. **Password hashes leave the server.** The login response is safe
   (`tests/unit/authService.test.ts:47` checks it), but four read paths return
   whole Prisma `User` rows, and Prisma returns every scalar column unless you
   `select` or `omit` it:
   - `GET /api/users`: `services/userService.ts:14-21` calls `findMany` with no
     `select`. The route only needs `requireAuth` (`routes/users.ts:13`), so a
     customer can list every user in their organization with `passwordHash`.
   - `GET /api/tickets` and `GET /api/tickets/:id`:
     `modules/tickets/ticket.repository.ts:39-46` and `:66-69` include
     `assignee: true` and `creator: true`, and `ticket.mapper.ts:21-34` spreads
     the record into the response.
   - `GET /api/tickets/:ticketId/comments`: `services/commentService.ts:106`
     includes `author: true`, and `serializeComment` (`:14-19`) spreads it.
2. **No ownership checks on comments.** Tickets are protected:
   `scopeFilters` and `assertCanReadTicket`
   (`modules/tickets/ticket.service.ts:39-69`) limit customers to their own
   tickets and everyone to their organization. Comments skip that check.
   `listComments` passes only the viewer's role
   (`controllers/commentController.ts:37-41`), and `getComments`
   (`services/commentService.ts:92-110`) only checks that the ticket exists.
   `createComment` (`:27-55`) does the same. So any logged-in customer who
   knows a ticket id can read and add public comments on it.
3. **Assignment bypass at creation.** `PATCH /:id/assign` requires an agent or
   admin (`modules/tickets/ticket.routes.ts:29-35`), but `POST /api/tickets`
   only needs `requireAuth` (`:27`), and `createTicketBodySchema`
   (`validation/ticketSchemas.ts:28-36`) accepts `assigneeId` and `teamId`. The
   service checks that the assignee is an agent (`ticket.service.ts:78-83`) but
   never checks who is asking, so a customer can create a ticket already
   assigned to the agent of their choice.
4. **`z.coerce.boolean()` on a query string.** `listCommentsQuerySchema`
   (`validation/commentSchemas.ts:14`) coerces with `Boolean(value)`, and
   `Boolean("false")` is `true`. So `?includeInternal=false` *includes* internal
   notes for agents. It's latent today only because the client always sends
   `true` (`packages/client/src/hooks/useComments.ts:17`). Customers are safe
   because the role check at `commentService.ts:98-99` still applies.
5. **Login has only the global throttle.** Sessions now expire (see the auth
   guide), and a per-IP limiter covers every route (`middleware/rateLimit.ts`,
   default 600 requests a minute in `config/env.ts:19`). There is no tighter
   limit on `POST /api/auth/login` (`routes/auth.ts:13`) and no failed-login
   log. The limiter's buckets live in process memory, so they reset on restart
   and are not shared between instances.

## Follow-Up Exercises

1. **Stop leaking password hashes.**
   *Goal:* no API response contains `passwordHash`.
   Add a shared `safeUserSelect` (id, name, email, role, teamId) and use it in
   `userService.getUsers`, in the `include`s of `findTicketById` and
   `listTickets`, and in `getComments`.
   **Check:** add an integration test that logs in as the seeded customer, calls
   `GET /api/users`, `GET /api/tickets/:id` and the comments endpoint, and
   asserts `JSON.stringify(response.body)` does not contain `passwordHash`. It
   fails before your change and passes after it.
2. **Customers read only their own tickets' comments.**
   *Goal:* close gap 2 without breaking agents.
   Add `canViewTicket(currentUser, ticket)` to `ticket.permissions.ts` with the
   rule from `assertCanReadTicket`, and call it from both ticket and comment
   reads.
   **Check:** unit-test `canViewTicket` for all four roles, and add an
   integration test where customer A gets `404` (not `403`, so ticket IDs don't
   leak) for the comments on customer B's ticket.
3. **Close the assignment bypass.**
   *Goal:* only agents and admins can set `assigneeId` or `teamId`.
   **Check:** an integration test where a customer POSTs a ticket with
   `assigneeId` gets `403` (or has the field ignored, whichever you decide), and
   your PR description says which you chose and why.
4. **Prove the coercion bug with Node alone, then fix it.**
   *Goal:* see why `z.coerce.boolean()` is wrong for query strings.
   Create `scratch/coerce.test.mjs` at the repo root (delete it afterwards):

   ```js
   import { test } from "node:test";
   import assert from "node:assert/strict";

   test("query-string booleans: Boolean('false') is true", () => {
     const raw = new URLSearchParams("includeInternal=false").get("includeInternal");
     assert.equal(raw, "false");
     assert.equal(Boolean(raw), true); // what z.coerce.boolean() does
   });
   ```

   **Check:** `node --test scratch/coerce.test.mjs` passes. Then replace the
   schema with `z.enum(["true", "false"]).transform((v) => v === "true")`, add a
   case to `tests/integration/validation.test.ts`, and run `npm test`.
5. Add `403` integration tests for customer access to dashboard routes.
   `tests/integration/authz.test.ts` covers only the `401` cases today.
   **Check:** the new test logs in as the seeded customer and gets `403` from
   `/api/dashboard/metrics` (`routes/dashboard.ts:17` requires an agent or admin).
6. Add CSRF discussion notes if the app moves to cookie-based sessions.
7. Add a stricter limit on login, and log failed attempts with the email hashed.
8. Add password reset design notes without implementing the feature.
