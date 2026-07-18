<!-- Author: Morgan Lee | Issue: #11 -->

# Git Workflow Guide

This guide explains how the HelpDesk team uses Git during normal feature work.
The goal is to make collaboration predictable: small branches, readable commits,
reviewable pull requests, and a clean `main` history.

## Branching Strategy

`main` is the protected trunk. It should always represent the latest reviewed
state of the project. Team members create short-lived branches from `main`, open
pull requests, respond to review, and merge through GitHub.

Branch names use this format:

```text
<type>/<issue-number>-<short-description>
```

Branch types:

- `feature/` for new behavior
- `fix/` for bug fixes
- `infra/` for CI, Docker, logging, monitoring, or tooling
- `docs/` for documentation
- `test/` for tests and test tooling

Examples:

- `feature/HD-7-ticket-list-component`
- `fix/HD-15-status-transition-bug`
- `infra/HD-22-add-ci-workflow`
- `docs/HD-3-write-api-design`
- `test/HD-18-ticket-service-validation`

## Typical Feature Workflow

Start by making sure local `main` is current:

```bash
git switch main
git pull origin main
```

Create a branch:

```bash
git switch -c feature/HD-7-ticket-list-component
```

Make your changes, then inspect them:

```bash
git status
git diff
```

Stage and commit:

```bash
git add packages/client docs
git commit -m "feat(client): add ticket list component (#7)"
```

Push the branch:

```bash
git push -u origin feature/HD-7-ticket-list-component
```

Open a pull request on GitHub. Fill out the PR template completely, request the
appropriate reviewer, and keep the PR focused on one logical change.

After review, make follow-up commits on the same branch:

```bash
git add .
git commit -m "fix(client): handle empty ticket list state (#7)"
git push
```

When the PR is approved, squash-merge it into `main` through GitHub and delete
the feature branch.

Update your local `main` after merge:

```bash
git switch main
git pull origin main
git branch -d feature/HD-7-ticket-list-component
```

## Merge Conflict Walkthrough

Imagine Sam and Morgan both edit `packages/shared/src/ticketTypes.ts`. Sam adds a
new `TicketPriority`, while Morgan changes the `TicketStatus` names. Sam's PR
merges first. Morgan now needs to update their branch.

Morgan starts on the feature branch:

```bash
git switch feature/HD-12-ticket-status-types
git fetch origin
git merge origin/main
```

Git reports a conflict:

```text
CONFLICT (content): Merge conflict in packages/shared/src/ticketTypes.ts
```

Open the file and look for conflict markers:

```text
<<<<<<< HEAD
export enum TicketStatus {
  Open = 'OPEN',
  InProgress = 'IN_PROGRESS',
}
=======
export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING = 'WAITING',
}
>>>>>>> origin/main
```

Edit the file so it contains the intended final version. Remove the conflict
markers. Then check the result:

```bash
git diff
```

Stage the resolved file and complete the merge:

```bash
git add packages/shared/src/ticketTypes.ts
git commit
```

Run validation before pushing:

```bash
npm run typecheck
npm run lint
```

Push the resolved branch:

```bash
git push
```

The important habit is to resolve the final behavior, not just remove the
markers. After a conflict, ask whether both developers' intended changes still
exist.

## Persona Switching

Because this project simulates a team, you can use Git aliases to switch local
commit identity. These commands set identity only for the current repository.

```bash
git config alias.persona-alex '!git config user.name "Alex Chen" && git config user.email "alex-chen-dev@example.com"'
git config alias.persona-sam '!git config user.name "Sam Rivera" && git config user.email "sam-rivera-dev@example.com"'
git config alias.persona-jordan '!git config user.name "Jordan Park" && git config user.email "jordan-park-dev@example.com"'
git config alias.persona-morgan '!git config user.name "Morgan Lee" && git config user.email "morgan-lee-dev@example.com"'
```

Use an alias before starting a branch:

```bash
git persona-sam
git config user.name
git config user.email
```

For a real GitHub workflow, replace the example emails with GitHub noreply
addresses or verified emails for the accounts being simulated.

## Commit Message Examples

Good:

```text
feat(server): add ticket creation endpoint (#7)
fix(client): preserve selected filters after refresh (#15)
docs: explain API pagination convention (#3)
infra: add Docker Compose development services (#22)
test(shared): cover ticket status transitions (#18)
refactor(server): extract ticket validation service (#31)
chore: update TypeScript workspace config (#34)
```

These are good because each message says what changed, where it changed when
useful, and which issue it relates to.

Bad:

```text
changes
fix stuff
WIP
updated files
ticket work
```

These are weak because reviewers cannot understand the purpose of the commit
without reading the diff. A useful commit message should help future readers
reconstruct the project history.

## Pull Request Description Best Practices

A good PR description should include:

- What changed
- Why the change exists
- Which issue it closes
- How the reviewer can test it
- Any trade-offs or follow-up work
- Screenshots for visual changes

Reviewers usually look for:

- Whether the change solves the stated problem
- Whether behavior matches the architecture docs and API contract
- Whether tests cover the risky parts
- Whether naming and structure match team conventions
- Whether the change is small enough to review confidently

## Rebase vs. Merge

Use `git merge origin/main` when you want the safest and most beginner-friendly
way to update a branch. Merge preserves history exactly and makes conflict
resolution straightforward.

Use `git rebase origin/main` when the branch is local to you or your team has
agreed that rewriting the branch history is acceptable. Rebase creates a cleaner
linear story, but it changes commit hashes and can confuse collaborators if the
branch is shared.

For this learning project, merge is the default recommendation during active
collaboration. Rebase is useful to learn, but it should be used deliberately.
