<!-- Author: Morgan Lee | Issue: #11 -->

# Contributing to HelpDesk

HelpDesk is a learning project, but the collaboration model should feel like a
professional team. The purpose of these guidelines is to make every change easy
to review, easy to trace, and easy to learn from.

## Branching Strategy

`main` is the protected trunk. Team members should not push directly to `main`.
All work should move through a pull request so another persona can review the
change and the project history stays understandable.

Create branches from the latest `main` using this format:

```text
<type>/<issue-number>-<short-description>
```

Supported branch types:

- `feature/` for new user-facing or system behavior
- `fix/` for bug fixes
- `infra/` for Docker, CI/CD, monitoring, logging, or repo automation
- `docs/` for documentation-only changes
- `test/` for test coverage, fixtures, or test tooling

Examples:

- `feature/HD-7-ticket-list-component`
- `fix/HD-15-status-transition-bug`
- `infra/HD-22-docker-compose-setup`
- `docs/HD-3-api-design-notes`
- `test/HD-18-ticket-service-validation`

## Commit Messages

Use Conventional Commits:

```text
<type>(<scope>): <description> (#<issue>)
```

Use a scope when the change is mostly inside one package. Omit the scope for
cross-cutting changes.

Supported commit types:

- `feat` for a new feature
- `fix` for a bug fix
- `docs` for documentation
- `infra` for infrastructure and operational tooling
- `test` for tests
- `refactor` for behavior-preserving code changes
- `chore` for maintenance

Supported scopes:

- `server`
- `client`
- `shared`

Examples:

- `feat(server): add ticket creation endpoint (#7)`
- `feat(client): add ticket list page (#8)`
- `fix(shared): correct ticket priority enum (#15)`
- `docs: document Git workflow (#3)`
- `infra: add Docker Compose skeleton (#22)`
- `test(server): cover ticket validation rules (#18)`
- `refactor(client): split ticket form state hook (#31)`
- `chore: update workspace dependencies (#34)`

## Pull Request Process

1. Start from the latest `main`.
2. Create a branch using the project branch naming convention.
3. Make small, logical commits that tell the story of the change.
4. Push the branch and open a pull request using the PR template.
5. Fill in every section of the template, including testing notes.
6. Request review from the persona who owns the affected area.
7. Address review feedback with follow-up commits.
8. Squash-merge into `main` after approval.
9. Delete the feature branch after merge.

Review ownership usually follows this map:

| Area                                      | Primary Reviewer |
| ----------------------------------------- | ---------------- |
| Backend API, Prisma, business logic       | Alex Chen        |
| Frontend pages, components, UI state      | Sam Rivera       |
| Docker, CI/CD, logging, monitoring        | Jordan Park      |
| Shared types, auth utilities, tests, docs | Morgan Lee       |

When a change crosses multiple areas, request review from each affected owner.

## Code Style

- TypeScript strict mode is enabled everywhere.
- React code uses functional components and hooks, not class components.
- Named exports are preferred over default exports, except for page components.
- Backend code follows layered architecture: routes -> controllers -> services -> data access.
- Public functions should have JSDoc comments explaining purpose, inputs, and return values.
- Errors should use a custom `AppError` class hierarchy.
- Avoid raw `throw new Error()` in application code once the error layer exists.

## Backend Layering Rules

Routes own HTTP plumbing: path registration, middleware attachment, and route
composition. They should not contain business rules.

Controllers map HTTP requests and responses. They parse inputs, call services,
translate service results into status codes, and pass errors to centralized error
handling.

Services own business logic. They decide whether an operation is allowed, enforce
workflow rules, and coordinate data access.

Data access owns Prisma calls and database-specific query details. Other layers
should not need to know how tables are shaped beyond shared domain types.

## Review Mindset

Review is part of the learning loop. A good review explains risk, asks clear
questions, and gives the author enough context to improve the change. Prefer
specific comments tied to code behavior over broad style preferences.
