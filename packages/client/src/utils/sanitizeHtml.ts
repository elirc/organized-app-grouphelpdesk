// Author: Sam Rivera
// Issue: Enterprise Sprint 2 - Sanitize rendered markdown HTML

const blockedTags = new Set(['script', 'iframe', 'object', 'embed', 'style']);

export function sanitizeHtml(html: string) {
  if (typeof window === 'undefined' || !window.DOMParser) {
    return html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/\son\w+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/\s(?:href|src)=(?:"javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gi, '');
  }

  const document = new window.DOMParser().parseFromString(html, 'text/html');

  for (const element of Array.from(document.body.querySelectorAll('*'))) {
    if (blockedTags.has(element.tagName.toLowerCase())) {
      element.remove();
      continue;
    }

    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();
      if (name.startsWith('on') || value.startsWith('javascript:')) {
        element.removeAttribute(attribute.name);
      }
    }
  }

  return document.body.innerHTML;
}
