<!-- Author: Morgan Lee | Issue: #11 -->

# ADR-001: Monorepo with npm Workspaces

## Status

Accepted

## Context

HelpDesk is a full-stack learning project with a React frontend, an Express
backend, and shared TypeScript contracts. The team expects many changes to cross
package boundaries. For example, adding a new ticket status requires updating the
shared type, backend validation, database behavior, and frontend UI.

The project also simulates a small team of senior engineers. The repository
should support realistic collaboration while keeping tooling understandable for
the learner. The team needs shared types, atomic pull requests, one dependency
installation flow, and a simple CI model.

## Decision

The team will use an npm workspaces monorepo with three packages:

- `@helpdesk/client` for the React frontend
- `@helpdesk/server` for the Express API
- `@helpdesk/shared` for shared TypeScript types and utilities

Root-level tooling will provide shared commands for linting, formatting, and type
checking. Package-level scripts will own package-specific workflows such as
client development, server development, database commands, and tests.

## Alternatives Considered

Separate repositories with a published shared npm package were rejected. This
would model a larger organization, but it adds release management, package
publishing, version coordination, and local development overhead. That overhead
would distract from the core learning goals at this project size.

Turborepo or Nx were also considered. Both can be valuable for larger monorepos,
especially when task caching, dependency graphs, and affected-package execution
matter. For HelpDesk, those tools add complexity before the project has enough
scale to benefit from them. npm workspaces provide the important monorepo
behavior with less machinery.

## Consequences

Shared types can stay in sync because frontend and backend packages consume the
same `@helpdesk/shared` workspace package. A single pull request can update the
API contract, backend behavior, and frontend usage together.

Developers can run one `npm install` from the root and work across the full
stack without publishing packages locally.

CI can validate the whole repository through root-level scripts, which keeps the
early pipeline simple.

The trade-off is that all packages share one repository history and one workspace
dependency tree. CI may run checks for all packages even when a change only
touches one area. This is acceptable for the current scale and learning goals.
