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

## Follow-Up Exercises

1. Add `403` integration tests for customer access to dashboard routes.
2. Add ticket ownership checks so customers can only read their own tickets.
3. Add CSRF discussion notes if the app moves to cookie-based sessions.
4. Add rate limiting to login.
5. Add password reset design notes without implementing the feature.
