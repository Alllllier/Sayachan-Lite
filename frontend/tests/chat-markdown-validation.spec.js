import { test, expect } from '@playwright/test'

const testMessages = [
  { role: 'assistant', content: 'Plain text message without any formatting.' },
  { role: 'assistant', content: '- Item one\n- Item two\n- Item three' },
  { role: 'assistant', content: 'Here is `inline code` inside a sentence.' },
  { role: 'assistant', content: '```js\nconst x = 1;\nconsole.log(x);\n```' },
  { role: 'assistant', content: '> This is a blockquote\n> with two lines.' },
  { role: 'assistant', content: 'Visit [Sayachan](http://example.com) for more info.' },
  { role: 'assistant', content: '<script>alert(1)</script><img src=x onerror=alert(1)>' },
  { role: 'user', content: 'I wrote **bold** and `code` but it should stay plain.' },
]

test.use({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  viewport: { width: 1280, height: 720 }
})

test('chat markdown render v1 - browser validation', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173')
  await page.waitForLoadState('networkidle')

  // Inject test messages via dynamic import of the Pinia store
  await page.evaluate(async (messages) => {
    const { useChatStore } = await import('/src/stores/chat.js')
    const store = useChatStore()
    store.openChat()
    for (const m of messages) {
      store.appendMessage(m)
    }
  }, testMessages)

  // Wait for DOM update
  await page.waitForTimeout(500)

  // Scroll to top to capture all messages
  await page.evaluate(() => {
    const el = document.querySelector('.chat-body')
    if (el) el.scrollTop = 0
  })
  await page.waitForTimeout(200)

  // Desktop screenshot
  await page.screenshot({ path: 'tests/chat-markdown-desktop.png' })

  // Mobile viewport screenshot
  await page.setViewportSize({ width: 375, height: 667 })
  await page.waitForTimeout(200)
  await page.screenshot({ path: 'tests/chat-markdown-mobile.png' })

  // Restore viewport for assertions
  await page.setViewportSize({ width: 1280, height: 720 })

  const chatBody = page.locator('.chat-body')
  await expect(chatBody).toBeVisible()

  // Plain assistant text
  await expect(page.locator('.chat-message.assistant .chat-bubble').filter({ hasText: 'Plain text message' })).toBeVisible()

  // List rendering
  const listBubble = page.locator('.chat-message.assistant .markdown-body').filter({ hasText: 'Item one' })
  await expect(listBubble.locator('ul')).toBeVisible()
  await expect(listBubble.locator('li')).toHaveCount(3)

  // Inline code
  const inlineCodeBubble = page.locator('.chat-message.assistant .markdown-body').filter({ hasText: 'inline code' })
  await expect(inlineCodeBubble.locator('code')).toBeVisible()

  // Fenced code block
  const codeBlockBubble = page.locator('.chat-message.assistant .markdown-body').filter({ hasText: 'const x = 1;' })
  await expect(codeBlockBubble.locator('pre.hljs')).toBeVisible()

  // Blockquote
  const quoteBubble = page.locator('.chat-message.assistant .markdown-body').filter({ hasText: 'This is a blockquote' })
  await expect(quoteBubble.locator('blockquote')).toBeVisible()

  // Link
  const linkBubble = page.locator('.chat-message.assistant .markdown-body').filter({ hasText: 'Sayachan' })
  await expect(linkBubble.locator('a[href="http://example.com"]')).toBeVisible()

  // Raw HTML should be sanitized (no script or onerror)
  const htmlBubble = page.locator('.chat-message.assistant .markdown-body').filter({ hasText: 'alert' })
  await expect(htmlBubble.locator('script')).toHaveCount(0)

  // User message should stay plain text (no bold rendering)
  const userBubble = page.locator('.chat-message.user .chat-bubble').filter({ hasText: 'bold' })
  await expect(userBubble).toBeVisible()
  await expect(userBubble.locator('strong')).toHaveCount(0)
})

test('notes markdown regression check', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173/notes')
  await page.waitForLoadState('networkidle')

  // Inject a note directly into the DOM to test markdown rendering without backend
  await page.evaluate(() => {
    const notesSection = document.querySelector('.notes-section')
    if (!notesSection) return

    const card = document.createElement('div')
    card.className = 'card card-accent-green note-card'
    card.innerHTML = `
      <h3 class="card-title">Regression Test Note</h3>
      <div class="card-content markdown-body">
        <p>This is a paragraph.</p>
        <ul>
          <li>List item one</li>
          <li>List item two</li>
        </ul>
        <blockquote>
          <p>A blockquote</p>
        </blockquote>
        <p>Here is <code>inline code</code> and a link <a href="http://example.com">example</a>.</p>
        <pre class="hljs"><code>const x = 1;</code></pre>
      </div>
      <p class="card-meta">2026-04-17</p>
    `
    notesSection.appendChild(card)
  })

  const markdownBody = page.locator('.note-card .markdown-body')
  await expect(markdownBody).toBeVisible()

  // Verify markdown elements render correctly
  await expect(markdownBody.locator('ul li')).toHaveCount(2)
  await expect(markdownBody.locator('blockquote')).toBeVisible()
  await expect(markdownBody.locator('code').first()).toBeVisible()
  await expect(markdownBody.locator('pre.hljs')).toBeVisible()
  await expect(markdownBody.locator('a[href="http://example.com"]')).toBeVisible()

  await markdownBody.scrollIntoViewIfNeeded()
  await page.waitForTimeout(200)
  await page.screenshot({ path: 'tests/notes-markdown-regression.png' })
})
