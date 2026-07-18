// Author: Sam Rivera
// Issue: Enterprise Sprint 3 - Expose operational admin workflows

import { useEffect, useState } from 'react';
import { Priority } from '@helpdesk/shared';
import type { EscalationReviewResult, SlaPolicy, User } from '@helpdesk/shared';

import { EmptyState } from '../components/shared/EmptyState';
import { api } from '../services/api';

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [policies, setPolicies] = useState<SlaPolicy[]>([]);
  const [name, setName] = useState('Standard high priority SLA');
  const [priority, setPriority] = useState(Priority.HIGH);
  const [responseHours, setResponseHours] = useState(4);
  const [resolutionHours, setResolutionHours] = useState(24);
  const [escalationHours, setEscalationHours] = useState(6);
  const [reviewResult, setReviewResult] = useState<EscalationReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const [userResponse, policyResponse] = await Promise.all([
      api.users.list(),
      api.sla.listPolicies(),
    ]);
    setUsers(userResponse.data);
    setPolicies(policyResponse.data);
  }

  useEffect(() => {
    refresh().catch((caught) =>
      setError(caught instanceof Error ? caught.message : 'Admin data could not be loaded.'),
    );
  }, []);

  async function createPolicy(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      await api.sla.createPolicy({
        name,
        priority,
        responseHours,
        resolutionHours,
        escalationHours,
      });
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'SLA policy could not be created.');
    }
  }

  async function runEscalationReview() {
    const response = await api.sla.reviewEscalations();
    setReviewResult(response.data);
    await refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-sm text-slate-600">Enterprise controls for policies and operations.</p>
      </div>
      {error ? <EmptyState title="Admin unavailable" description={error} /> : null}
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded border border-line bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">SLA policies</h2>
            <button
              className="rounded border border-line px-3 py-2 text-sm font-semibold"
              onClick={runEscalationReview}
            >
              Review escalations
            </button>
          </div>
          {reviewResult ? (
            <p className="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm">
              Escalated {reviewResult.escalatedTicketIds.length} tickets at{' '}
              {new Date(reviewResult.reviewedAt).toLocaleString()}.
            </p>
          ) : null}
          <div className="mt-4 space-y-3">
            {policies.map((policy) => (
              <div key={policy.id} className="rounded border border-line p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <strong>{policy.name}</strong>
                  <span>{policy.priority}</span>
                </div>
                <p className="mt-1 text-slate-600">
                  Response {policy.responseHours}h, resolution {policy.resolutionHours}h, escalation{' '}
                  {policy.escalationHours}h
                </p>
              </div>
            ))}
          </div>
        </div>
        <form className="rounded border border-line bg-white p-5" onSubmit={createPolicy}>
          <h2 className="font-semibold">New SLA policy</h2>
          <label className="mt-4 block text-sm font-medium">
            Name
            <input
              className="mt-1 w-full rounded border border-line px-3 py-2"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="mt-3 block text-sm font-medium">
            Priority
            <select
              className="mt-1 w-full rounded border border-line px-3 py-2"
              value={priority}
              onChange={(event) => setPriority(event.target.value as Priority)}
            >
              {Object.values(Priority).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <input
              className="rounded border border-line px-3 py-2"
              min={1}
              type="number"
              value={responseHours}
              onChange={(event) => setResponseHours(Number(event.target.value))}
            />
            <input
              className="rounded border border-line px-3 py-2"
              min={1}
              type="number"
              value={resolutionHours}
              onChange={(event) => setResolutionHours(Number(event.target.value))}
            />
            <input
              className="rounded border border-line px-3 py-2"
              min={1}
              type="number"
              value={escalationHours}
              onChange={(event) => setEscalationHours(Number(event.target.value))}
            />
          </div>
          <button className="mt-4 rounded bg-focus px-4 py-2 text-sm font-medium text-white">
            Create policy
          </button>
        </form>
      </section>
      <section className="rounded border border-line bg-white p-5">
        <h2 className="font-semibold">Users</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {users.map((user) => (
            <div key={user.id} className="rounded border border-line p-3 text-sm">
              <strong>{user.name}</strong>
              <p className="text-slate-600">{user.email}</p>
              <p className="mt-1 text-xs font-semibold">{user.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
