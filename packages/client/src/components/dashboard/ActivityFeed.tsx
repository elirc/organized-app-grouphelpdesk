// Author: Sam Rivera
// Issue: #32 â€” Show recent activity log entries

import { formatDateTime } from '../../utils/formatters';

interface ActivityFeedProps {
  activity: unknown[];
}

export function ActivityFeed({ activity }: ActivityFeedProps) {
  return (
    <section className="rounded border border-line bg-white p-5">
      <h2 className="font-semibold">Recent activity</h2>
      <div className="mt-4 max-h-96 space-y-3 overflow-auto">
        {activity.map((entry, index) => {
          const item = entry as {
            id?: string;
            action?: string;
            createdAt?: string;
            ticket?: { title?: string };
            user?: { name?: string };
          };
          return (
            <article
              key={item.id ?? index}
              className="border-b border-line pb-3 text-sm last:border-0"
            >
              <p className="font-medium">
                {item.action ?? 'Activity'} on {item.ticket?.title ?? 'ticket'}
              </p>
              <p className="text-slate-600">
                {item.user?.name ?? 'System'} Â· {formatDateTime(item.createdAt)}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
