<!-- Author: Morgan Lee | Issue: Enterprise Sprint 2 -->

# Sprint 2: Events, Attachments, and Knowledge Lifecycle

## Sprint Goal

Add enterprise workflows that make the app feel like more than ticket CRUD:
notifications, outbox events, attachment metadata, and a governed knowledge base
lifecycle. The learning goal is to help a junior engineer reason about side
effects, content safety, and workflow state.

## User Stories

### Story 1: Write Outbox Events

As an integration owner, I want important business changes written to an outbox
so that downstream delivery can be retried outside the original request.

Acceptance criteria:

- Ticket creation writes a `ticket.created` event.
- Ticket status changes write a `ticket.status_changed` event.
- Ticket comments and attachments write dedicated ticket events.
- Notification creation writes a notification event.
- Outbox entries track status, attempts, next attempt, and processed time.

Mid-senior learning focus:

- Learn why "send the email inside the request" is brittle.
- Separate business state persistence from integration delivery.
- Understand eventual consistency in a small, inspectable example.

### Story 2: Store Notifications

As a support agent, I want notifications for assignments, comments, escalation,
and article review requests so I can track work that needs my attention.

Acceptance criteria:

- Notifications are persisted per user.
- The client header shows an unread notification count.
- Notifications can be marked as read.
- Assignment, comment, SLA escalation, and article review flows create
  notifications.

Mid-senior learning focus:

- Model user-specific read state separately from shared domain events.
- Avoid treating a notification as the same thing as an audit log.
- Design notification creation as a reusable service.

### Story 3: Add Attachment Metadata

As a support agent, I want to attach supporting files to a ticket so that
diagnostic evidence can travel with the case.

Acceptance criteria:

- Tickets expose attachment metadata list and create endpoints.
- Attachments validate file name, MIME type, and size.
- Attachments store a generated storage key.
- Attachment creation logs activity and writes an outbox event.
- The ticket detail screen shows and creates attachment metadata.

Mid-senior learning focus:

- Start with metadata before adding binary upload complexity.
- Validate file constraints server-side even if the UI restricts choices.
- Separate storage identifiers from user-facing file names.

### Story 4: Govern Knowledge Base Articles

As a knowledge manager, I want articles to move through draft, review, publish,
and archive states so support content has a lifecycle.

Acceptance criteria:

- Articles have a `status`.
- Agents can submit articles for review.
- Admins can approve or archive articles.
- Article edits create version snapshots.
- Users can submit helpful/not-helpful feedback.
- Rendered markdown is sanitized in the client before injection.

Mid-senior learning focus:

- Model workflow status explicitly instead of inferring from timestamps.
- Preserve previous versions before mutating content.
- Treat markdown as untrusted content once it becomes HTML.

## Implementation Notes

Implemented files:

- `packages/server/src/services/outboxService.ts`
- `packages/server/src/services/notificationService.ts`
- `packages/server/src/services/attachmentService.ts`
- `packages/server/src/services/commentService.ts`
- `packages/server/src/services/knowledgeBaseService.ts`
- `packages/server/src/routes/attachments.ts`
- `packages/server/src/routes/notifications.ts`
- `packages/server/src/routes/knowledgeBase.ts`
- `packages/shared/src/types/notification.ts`
- `packages/shared/src/types/attachment.ts`
- `packages/shared/src/types/knowledgeBase.ts`
- `packages/client/src/components/tickets/AttachmentPanel.tsx`
- `packages/client/src/components/layout/Header.tsx`
- `packages/client/src/utils/sanitizeHtml.ts`
- `packages/client/src/pages/KnowledgeBasePage.tsx`

Key implementation details:

- The outbox stores JSON payloads as strings to keep the SQLite-backed demo
  simple while still teaching the transactional outbox pattern.
- Notifications are distinct rows, not just activity logs. Activity answers
  "what happened"; notifications answer "who should look at this."
- Attachments are metadata-only in this sprint. A future object-storage adapter
  could use the stored `storageKey` without changing the ticket domain.
- Knowledge base edits write `ArticleVersion` rows before updating the current
  article, which mirrors production content systems.
- Markdown rendering now passes through a small HTML sanitizer before using
  `dangerouslySetInnerHTML`.

Review questions:

1. What problem does the outbox solve that direct email delivery does not?
2. Why should attachment metadata be persisted before object storage is added?
3. Where would you enforce virus scanning or file extension rules?
4. What race condition could occur when two users edit an article at once?
