import { assistantMarkdownReply, cockpitProjects, cockpitTasks } from './fixtures.js'

function json(data, status = 200) {
  return {
    status,
    contentType: 'application/json',
    body: JSON.stringify(data)
  }
}

function createGate() {
  let release
  const promise = new Promise(resolve => {
    release = resolve
  })
  return { promise, release }
}

export async function installChatReviewApiMocks(page, options = {}) {
  const cockpitGate = options.delayCockpit ? createGate() : null
  const chatGate = options.delayChat ? createGate() : null
  const chatReply = options.chatReply || assistantMarkdownReply
  const chatStatus = options.chatStatus || 200

  await page.route('http://localhost:3001/**', async route => {
    const request = route.request()
    const url = new URL(request.url())
    const method = request.method()
    const pathname = url.pathname

    if (method === 'GET' && pathname === '/projects') {
      if (cockpitGate) await cockpitGate.promise
      await route.fulfill(json(cockpitProjects))
      return
    }

    if (method === 'GET' && pathname === '/tasks') {
      if (cockpitGate) await cockpitGate.promise
      await route.fulfill(json(cockpitTasks))
      return
    }

    if (method === 'POST' && pathname === '/ai/chat') {
      if (chatGate) await chatGate.promise
      if (chatStatus >= 400) {
        await route.fulfill(json({ error: 'mocked chat failure' }, chatStatus))
        return
      }
      await route.fulfill(json({ reply: chatReply }))
      return
    }

    await route.fulfill(json({ error: `unmocked ${method} ${pathname}` }, 500))
  })

  return {
    releaseCockpit: () => cockpitGate?.release(),
    releaseChat: () => chatGate?.release()
  }
}

