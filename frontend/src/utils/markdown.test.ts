import { describe, expect, it, vi } from 'vitest'

vi.mock('dompurify', () => ({
  default: {
    sanitize: (html) => html
  }
}))

import { renderMarkdown } from './markdown.js'

describe('markdown renderer', () => {
  it('renders task-list markdown as disabled checkboxes', () => {
    const rendered = renderMarkdown('- [ ] Draft note\n- [x] Ship note')

    expect(rendered).toContain('class="task-list-item"')
    expect(rendered).toContain('type="checkbox"')
    expect(rendered).toContain('disabled')
    expect(rendered).toContain('Draft note')
    expect(rendered).toContain('checked')
    expect(rendered).toContain('Ship note')
  })
})
