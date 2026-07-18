<!-- Author: Morgan Lee | Issue: #22 -->

# ADR-003: Comment Visibility Model

## Status

Accepted

## Context

Tickets need public comments for requesters and internal notes for agents. The
team needed a model that supports both without overcomplicating early phases.

## Decision

Comments live in one `Comment` table with an `isInternal` boolean. Public
comments use `isInternal = false`; internal notes use `isInternal = true`.
Filtering happens in the comment service so requesters cannot see internal notes.

## Alternatives Considered

A separate `InternalNote` table was rejected because it would complicate queries
and UI rendering. The frontend wants one chronological thread, and two tables
would require merging records after fetching.

A full ACL system was rejected as overengineered for this project. Real
permission systems are important, but Phase 2 only needs to demonstrate role
aware filtering.

## Consequences

The single-table model makes chronological comments easy to query and render. The
trade-off is discipline: every API path that returns comments must consistently
apply visibility filtering.
