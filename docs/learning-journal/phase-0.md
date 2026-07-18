<!-- Author: Morgan Lee | Issue: #11 -->

# Phase 0: Planning, Architecture, and Repo Scaffolding

## What Was Accomplished

In Phase 0, I set up the foundation for the HelpDesk project before writing
application code. The repository now has a monorepo structure, package-level
configuration, shared tooling, issue templates, a pull request template,
architecture documentation, team guides, and the first architecture decision
record.

The main accomplishment was turning an idea into a structured project space. The
repo now gives future work a clear place to go: client code in
`packages/client`, server code in `packages/server`, shared contracts in
`packages/shared`, architecture notes in `docs/architecture`, and team workflow
guides in `docs/guides`.

## What I Learned About Planning Before Code

It is tempting to start a project by immediately building screens or API routes.
Phase 0 showed why teams invest time before that happens. Planning creates shared
language. If the team agrees on what a ticket is, how branches are named, how API
errors look, and where code should live, later implementation work becomes less
chaotic.

The planning work also forces decisions into the open. Instead of quietly making
assumptions while coding, the docs make those assumptions visible. That gives the
team something to review and improve before those choices become expensive to
change.

## What I Learned About Monorepos and Shared Types

The monorepo structure makes sense for HelpDesk because the frontend and backend
will depend on the same domain ideas. A ticket status like `IN_PROGRESS` is not
just a database value or a UI label. It is part of the contract between the
client, server, tests, and documentation.

Putting shared types in `@helpdesk/shared` should reduce drift. If the server
accepts one set of ticket priorities but the client renders a different set, the
project becomes confusing quickly. Shared types give both sides one source of
truth.

I also learned that monorepos are a trade-off. They make atomic changes easier,
but they also mean all packages share one repository and dependency tree. For a
learning project, that seems like the right balance because seeing the full stack
together is part of the point.

## API Design Decisions

The API design uses REST because it is familiar, readable, and maps well to the
ticket resource. Tickets can be created, listed, fetched, updated, and deleted
with standard HTTP methods. That makes it easier to reason about the first
backend implementation.

The API uses `/api` as a base path, JSON for request and response bodies, and a
consistent error shape:

```json
{
  "error": {
    "code": "TICKET_NOT_FOUND",
    "message": "Ticket could not be found."
  }
}
```

That consistency should make frontend error handling easier later. Instead of
every endpoint inventing its own error format, the client can expect a stable
shape.

Pagination also got defined early with `page`, `limit`, and a pagination object
in the response. That matters because ticket lists could grow, and the dashboard
will eventually need filtered views.

The main trade-off is that REST can become awkward for workflows that are not
simple CRUD, like assigning tickets or tracking status transitions. The design
leaves space for future action-oriented endpoints such as
`PATCH /api/tickets/:id/assign` while keeping the first ticket endpoints simple.

## Reflection on the Architecture Overview

Writing the architecture overview was harder than just listing technologies. It
required describing how a system should behave before the system exists. That
felt abstract at first, but it clarified the boundaries between layers.

The create-ticket walkthrough was especially helpful. Tracing one request from a
React form to the database made the architecture feel concrete. It showed why the
backend has routes, controllers, services, and data access instead of putting
everything in one route handler.

The overview also made it easier to say what is out of scope. Real auth,
deployment, WebSockets, and advanced monitoring are all useful ideas, but adding
them too early would make the learning project harder to understand.

## Reflection on the ADR

The ADR changed the monorepo decision from a preference into a record. Writing
down context, alternatives, and consequences made the decision feel more honest.
It was not just "use npm workspaces because that sounds good." It became "use
npm workspaces because shared types and atomic PRs matter here, while Turborepo
or separate repositories would add more process than this project needs."

Formalizing a decision also makes it easier to revisit later. If the project
grows and npm workspaces become limiting, the team can compare that new reality
against the original reasoning.

## What I Am Looking Forward To In Phase 1

In Phase 1, I am looking forward to turning the structure into the first real
vertical slice. The most interesting part will be seeing how the shared ticket
types, Express route structure, and React UI start to connect.

I am also looking forward to practicing Git in a more realistic way: creating
branches, making small commits, opening PRs, and reviewing changes through the
lens of the team personas.

## Things I Would Google To Learn More

- I want to understand more about Prisma's query engine and how Prisma maps
  TypeScript calls to SQLite queries.
- I should read about REST API versioning strategies and when teams introduce
  `/v1` paths.
- I want to learn more about TypeScript project references in monorepos.
- I should look up examples of layered Express architectures in production
  Node.js projects.
