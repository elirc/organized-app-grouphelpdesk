// Author: Sam Rivera
// Issue: #6 â€” Provide client formatting helpers

export function formatDateTime(value: string | null | undefined) {
  if (!value) return 'Not set';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatHours(value: number) {
  return `${value.toFixed(1)}h`;
}
