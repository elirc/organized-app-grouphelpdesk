<!-- Author: Morgan Lee | Issue: Learning Phase 2 -->

# Runtime Validation Guide

## Purpose

This guide explains the Phase 2 backend validation upgrade. The goal is to teach
why TypeScript types are not enough at HTTP boundaries and how Zod helps turn
untrusted request data into trusted application input.

## What Files To Read

- [packages/server/src/middleware/validateRequest.ts](../../packages/server/src/middleware/validateRequest.ts)
- [packages/server/src/validation/ticketSchemas.ts](../../packages/server/src/validation/ticketSchemas.ts)
- [packages/server/src/validation/commentSchemas.ts](../../packages/server/src/validation/commentSchemas.ts)
- [packages/server/src/validation/knowledgeBaseSchemas.ts](../../packages/server/src/validation/knowledgeBaseSchemas.ts)
- [packages/server/src/validation/userSchemas.ts](../../packages/server/src/validation/userSchemas.ts)
- [packages/server/src/routes/tickets.ts](../../packages/server/src/routes/tickets.ts)
- [packages/server/src/controllers/ticketController.ts](../../packages/server/src/controllers/ticketController.ts)
- [tests/integration/validation.test.ts](../../tests/integration/validation.test.ts)

## What Problem This Pattern Solves

TypeScript checks code before it runs. It does not check JSON sent by a browser,
curl command, mobile app, script, or malicious client.

This interface is useful:

```ts
interface CreateTicketInput {
  title: string;
  description: string;
  priority: Priority;
  createdBy: string;
}
```

But this request can still arrive at runtime:

```json
{
  "title": "",
  "description": 123,
  "priority": "SEVERE"
}
```

Without runtime validation, the controller or service has to discover those
problems manually, usually in scattered checks.

## How The Pattern Works In This Repo

Routes now validate request boundaries before controllers run.

Example from `tickets.ts`:

```ts
ticketRouter.post('/', validateBody(createTicketBodySchema), createTicket);
```

That means:

1. Express receives raw JSON.
2. `validateBody` parses `req.body` with Zod.
3. Invalid input returns a structured `400` response.
4. Valid input is stored on `res.locals.validatedBody`.
5. The controller reads validated data and calls the service.

The controller no longer hand-parses every field:

```ts
const body = getValidatedBody<CreateTicketBody>(res);
const ticket = await ticketService.createTicket(body);
```

## What Changed

New validation middleware:

- `validateBody`
- `validateQuery`
- `validateParams`
- `getValidatedBody`
- `getValidatedQuery`
- `getValidatedParams`

New schemas:

- create ticket
- update ticket
- assign ticket
- list ticket query params
- create comment
- list comments query params
- create/update knowledge base article
- user filtering
- common ID params

New tests:

- invalid ticket creation input
- invalid ticket list query params
- empty update body
- missing comment body
- invalid user role filter

## Why It Changed

Before this phase, controllers did work like this:

```ts
const status = splitQuery(req.query.status) as TicketStatus[] | undefined;
```

That cast makes TypeScript quiet. It does not prove the query string contains a
real ticket status.

After this phase, Zod checks the runtime value and returns a readable `400`
before the request reaches business logic.

## TypeScript Types vs Runtime Validation

TypeScript answers:

- "Does this source code type-check?"
- "Did I call this function with the expected static shape?"
- "Can the compiler catch mistakes before running the app?"

Runtime validation answers:

- "Did this actual HTTP request contain valid data?"
- "Can this string become a valid enum?"
- "Is this page number within allowed bounds?"
- "Can the server safely pass this data to the service?"

You need both.

## Why HTTP Input Is Untrusted

The frontend is not the only caller of your API. Anyone can send a request:

```bash
curl -X POST http://localhost:3001/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"priority":"SEVERE"}'
```

Frontend validation improves user experience. Backend validation protects the
system boundary.

## Where Validation Belongs

In this repo, validation belongs at the route boundary:

```text
route middleware validates input
  -> controller receives parsed input
    -> service enforces business rules
      -> repository/database persists data
```

Validation schemas should answer: "Is this request shaped correctly?"

Services should answer: "Is this operation allowed by business rules?"

Example:

- Zod checks that `status` is one of the known ticket statuses.
- The service checks whether the transition from the old status to the new
  status is allowed.

## How Validation Improves Debugging

Before this phase, a bad request might fail deep in the service or database.

After this phase, the API returns:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body.",
    "details": {
      "issues": [
        {
          "path": "priority",
          "message": "Invalid enum value...",
          "code": "invalid_enum_value"
        }
      ]
    }
  }
}
```

That tells the client and developer exactly which field is wrong.

## Common Mistakes

- Casting `req.body as SomeType` and calling it validation.
- Validating in both controller and service with duplicated rules.
- Returning a generic `500` for bad user input.
- Letting Zod schemas grow business rules that belong in services.
- Forgetting to validate query params because they look harmless.
- Trusting frontend validation and skipping backend validation.

## What A Mid-Level Engineer Should Notice

- The route is now the trust boundary.
- Controllers are smaller and easier to read.
- Validation errors are consistently `400`.
- Business rules remain in services.
- Tests check invalid input without needing a database.
- TypeScript types still matter, but they are not pretending to be runtime
  guards.

## How To Debug This

1. If a request returns `400`, inspect the response `details.issues`.
2. Find the route and identify which schema is attached.
3. Open the schema and compare it to the request payload.
4. If the schema accepts the request but the service rejects it, you are probably
   dealing with a business rule, not a shape problem.
5. Add a validation test before changing the schema.

## How To Review This In A PR

Check:

- Are all externally supplied bodies, params, and query strings validated?
- Are schemas close to the route boundary?
- Are controllers simpler after validation?
- Are invalid requests returning `400`, not `422` or `500`?
- Do tests cover at least one bad payload per important route family?
- Are business rules still in services?

## Follow-Up Exercises

1. Add a test for invalid `PATCH /api/tickets/:id/assign` input.
2. Add a schema for dashboard query params if dashboard filtering is introduced.
3. Try sending `GET /api/tickets?limit=1000` and explain why it fails.
4. Compare client-side form validation with server-side Zod validation.
5. Write a short note explaining why Zod does not replace TypeScript.
