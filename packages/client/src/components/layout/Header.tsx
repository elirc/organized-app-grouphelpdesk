// Author: Sam Rivera
// Issue: Learning Phase 4 - Show authenticated user context in the layout

import { useEffect, useState } from 'react';
import type { Notification } from '@helpdesk/shared';

import { useAuth } from '../../auth/AuthProvider';
import { api } from '../../services/api';

export function Header() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;

    api.notifications
      .list()
      .then((response) => setNotifications(response.data))
      .catch(() => setNotifications([]));
  }, [user]);

  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  return (
    <header className="flex items-center justify-between border-b border-line bg-white px-6 py-4">
      <div>
        <p className="text-sm text-slate-600">Internal support operations</p>
        {user ? (
          <p className="text-xs text-slate-500">
            Signed in as {user.name} ({user.role})
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded border border-line px-3 py-2 text-sm font-semibold">
          {unreadCount} unread
        </span>
        <button
          className="rounded-lg border border-line px-3 py-2 text-sm font-semibold"
          onClick={logout}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
