// Author: Sam Rivera
// Issue: #8 â€” Provide form validation helpers

export function required(value: string, label: string) {
  return value.trim().length === 0 ? `${label} is required.` : undefined;
}

export function splitTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}
