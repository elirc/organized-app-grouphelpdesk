// Author: Sam Rivera
// Issue: #8 â€” Implement controlled ticket creation form

import { useState } from 'react';
import { Priority } from '@helpdesk/shared';
import type { CreateTicketInput } from '@helpdesk/shared';

import { required, splitTags } from '../../utils/validators';

interface TicketFormProps {
  onSubmit: (input: CreateTicketInput) => Promise<void>;
}

export function TicketForm({ onSubmit }: TicketFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(Priority.MEDIUM);
  const [tags, setTags] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const validationError = required(title, 'Title') ?? required(description, 'Description');

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        title,
        description,
        priority,
        tags: splitTags(tags),
      });
      setTitle('');
      setDescription('');
      setTags('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not create ticket.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-4 rounded border border-line bg-white p-5" onSubmit={handleSubmit}>
      {error && (
        <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>
      )}
      <label className="block text-sm font-medium">
        Title
        <input
          className="mt-1 w-full rounded border border-line px-3 py-2"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <label className="block text-sm font-medium">
        Description
        <textarea
          className="mt-1 min-h-32 w-full rounded border border-line px-3 py-2"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>
      <label className="block text-sm font-medium">
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
      <label className="block text-sm font-medium">
        Tags
        <input
          className="mt-1 w-full rounded border border-line px-3 py-2"
          placeholder="network, access"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
        />
      </label>
      <button
        className="rounded bg-focus px-4 py-2 font-medium text-white"
        disabled={submitting}
        type="submit"
      >
        {submitting ? 'Creating...' : 'Create ticket'}
      </button>
    </form>
  );
}
