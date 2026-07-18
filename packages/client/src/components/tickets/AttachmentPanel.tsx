// Author: Sam Rivera
// Issue: Enterprise Sprint 2 - Manage ticket attachment metadata

import { useEffect, useState } from 'react';
import type { Attachment } from '@helpdesk/shared';

import { api } from '../../services/api';
import { formatDateTime } from '../../utils/formatters';

interface AttachmentPanelProps {
  ticketId: string;
}

export function AttachmentPanel({ ticketId }: AttachmentPanelProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [fileName, setFileName] = useState('');
  const [mimeType, setMimeType] = useState('application/pdf');
  const [sizeBytes, setSizeBytes] = useState(1024);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const response = await api.attachments.list(ticketId);
    setAttachments(response.data);
  }

  useEffect(() => {
    refresh();
  }, [ticketId]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      await api.attachments.create(ticketId, { fileName, mimeType, sizeBytes });
      setFileName('');
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not add attachment metadata.');
    }
  }

  return (
    <section className="rounded border border-line bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">Attachments</h2>
        <span className="text-sm text-slate-500">{attachments.length}</span>
      </div>
      {error ? (
        <p className="mt-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      <form className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_140px_auto]" onSubmit={handleSubmit}>
        <input
          className="rounded border border-line px-3 py-2 text-sm"
          placeholder="File name"
          value={fileName}
          onChange={(event) => setFileName(event.target.value)}
        />
        <select
          className="rounded border border-line px-3 py-2 text-sm"
          value={mimeType}
          onChange={(event) => setMimeType(event.target.value)}
        >
          <option value="application/pdf">PDF</option>
          <option value="image/png">PNG image</option>
          <option value="text/plain">Text</option>
        </select>
        <input
          className="rounded border border-line px-3 py-2 text-sm"
          min={1}
          type="number"
          value={sizeBytes}
          onChange={(event) => setSizeBytes(Number(event.target.value))}
        />
        <button className="rounded bg-focus px-4 py-2 text-sm font-medium text-white">Add</button>
      </form>
      <div className="mt-4 space-y-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded border border-line px-3 py-2 text-sm"
          >
            <span className="font-medium">{attachment.fileName}</span>
            <span className="text-slate-500">
              {attachment.mimeType} - {Math.ceil(attachment.sizeBytes / 1024)} KB -{' '}
              {formatDateTime(attachment.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
