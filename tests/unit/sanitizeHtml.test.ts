// Author: Morgan Lee
// Issue: Enterprise Sprint 2 - Test markdown HTML sanitization

import { describe, expect, it } from 'vitest';

import { sanitizeHtml } from '../../packages/client/src/utils/sanitizeHtml';

describe('sanitizeHtml', () => {
  it('removes executable tags and event handlers in node fallback mode', () => {
    const html = sanitizeHtml(
      '<p onclick="alert(1)">Hi</p><script>alert(1)</script><a href="javascript:alert(1)">bad</a>',
    );

    expect(html).toContain('<p>Hi</p>');
    expect(html).not.toContain('script');
    expect(html).not.toContain('onclick');
    expect(html).not.toContain('javascript:');
  });
});
