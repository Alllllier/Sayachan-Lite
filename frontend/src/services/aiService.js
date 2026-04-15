// AI Service

const AI_BASE = ''

export async function summarizeText(text) {
  const API_KEY = import.meta.env.VITE_GLM_API_KEY

  const fallback = () => {
    const summary = text.slice(0, 50) + (text.length > 50 ? '...' : '') || 'Empty content'
    console.log('[AI Service] Fallback to mock summary:', summary)
    return { summary }
  }

  // Fallback: API key missing
  if (!API_KEY) {
    console.error('[AI Service] VITE_GLM_API_KEY not found, using fallback')
    return fallback()
  }

  const promptText = `始终使用简体中文输出摘要。保留必要英文技术术语（如 API、Vue、MongoDB）。

用 2-3 句高信息密度中文摘要以下内容：

${text}`

  try {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'glm-4.5-air',
        messages: [{ role: 'user', content: promptText }],
        max_tokens: 120,
        temperature: 0.3,
        thinking: { type: 'disabled' },
        stream: false
      })
    })

    // Fallback: fetch failed
    if (!response.ok) {
      console.error('[AI Service] API request failed:', response.status)
      return fallback()
    }

    const data = await response.json()
    console.log('[GLM raw response]', data)

    // Parse content: support both string and array format
    let summary = ''
    const messageContent = data?.choices?.[0]?.message?.content

    if (typeof messageContent === 'string') {
      summary = messageContent.trim()
    } else if (Array.isArray(messageContent)) {
      const textItem = messageContent.find(item => item?.type === 'text')
      summary = textItem?.text?.trim() || ''
    }

    // Fallback: empty or invalid response
    if (!summary) {
      console.error('[AI Service] Invalid API response structure')
      return fallback()
    }

    console.log('[AI Service] GLM summary generated')
    return { summary }

  } catch (error) {
    console.error('[AI Service] API call error:', error.message)
    return fallback()
  }
}

export async function generateWeeklyReview(notes, projects) {
  const API_KEY = import.meta.env.VITE_GLM_API_KEY

  const fallback = () => {
    const notesCount = notes?.length || 0
    const projectsCount = projects?.length || 0
    const review = `This week you have ${notesCount} note${notesCount !== 1 ? 's' : ''} and ${projectsCount} project${projectsCount !== 1 ? 's' : ''} in progress. Focus next on active items.`
    console.log('[AI Service] Fallback to mock weekly review:', review)
    return { review }
  }

  // Fallback: API key missing
  if (!API_KEY) {
    console.error('[AI Service] VITE_GLM_API_KEY not found, using fallback')
    return fallback()
  }

  // Compress input context
  const recentNotes = (notes || []).slice(0, 5).map(n => {
    const title = n.title || '(无标题)'
    const content = (n.content || '').slice(0, 130)
    return `笔记：${title} - ${content}`
  }).join('\n')

  const recentProjects = (projects || []).slice(0, 3).map(p => {
    const name = p.name || '(无项目名)'
    const summary = p.summary || '(无描述)'
    return `项目：${name} - ${summary}`
  }).join('\n')

  const contextText = `最近笔记：\n${recentNotes || '(无)'}\n\n最近项目：\n${recentProjects || '(无)'}`

  const promptText = `始终使用简体中文输出。保留必要英文技术术语。

基于以下内容生成 3-5 句周回顾：
1. 本周主要推进
2. 当前重点方向
3. 一个建议关注点

${contextText}`

  try {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'glm-4.5-air',
        messages: [{ role: 'user', content: promptText }],
        max_tokens: 180,
        temperature: 0.4,
        thinking: { type: 'disabled' },
        stream: false
      })
    })

    if (!response.ok) {
      console.error('[AI Service] Weekly Review API request failed:', response.status)
      return fallback()
    }

    const data = await response.json()
    console.log('[GLM weekly review response]', data)

    let review = ''
    const messageContent = data?.choices?.[0]?.message?.content

    if (typeof messageContent === 'string') {
      review = messageContent.trim()
    } else if (Array.isArray(messageContent)) {
      const textItem = messageContent.find(item => item?.type === 'text')
      review = textItem?.text?.trim() || ''
    }

    if (!review) {
      console.error('[AI Service] Weekly Review invalid API response')
      return fallback()
    }

    console.log('[AI Service] GLM weekly review generated')
    return { review }

  } catch (error) {
    console.error('[AI Service] Weekly Review API call error:', error.message)
    return fallback()
  }
}


export async function recommendFocus(notes, projects) {
  const API_KEY = import.meta.env.VITE_GLM_API_KEY

  const fallback = () => {
    const inProgressProjects = projects?.filter(p => p.status === 'in_progress').length || 0
    const recentNotes = notes?.length || 0
    const recommendation = `Focus this week on ${inProgressProjects} active project${inProgressProjects !== 1 ? 's' : ''} and ${recentNotes} unresolved recent note${recentNotes !== 1 ? 's' : ''}.`
    console.log('[AI Service] Fallback to mock focus recommendation:', recommendation)
    return { recommendation }
  }

  if (!API_KEY) {
    console.error('[AI Service] VITE_GLM_API_KEY not found, using fallback')
    return fallback()
  }

  // Compress input context
  const recentNotes = (notes || []).slice(0, 5).map(n => {
    const title = n.title || '(无标题)'
    const content = (n.content || '').slice(0, 100)
    return `笔记：${title} - ${content}`
  }).join('\n')

  const recentProjects = (projects || []).slice(0, 3).map(p => {
    const name = p.name || '(无项目名)'
    const summary = p.summary || '(无描述)'
    return `项目：${name} - ${summary}`
  }).join('\n')

  const contextText = `最近笔记：\n${recentNotes || '(无)'}\n\n最近项目：\n${recentProjects || '(无)'}`

  const promptText = `始终使用简体中文输出。保留必要英文技术术语。

基于以下近期推进情况，给出一个"当前最值得聚焦的方向"：
1. 当前建议聚焦方向
2. 为什么它优先
3. 一个风险提醒或注意点

用 2-3 句简洁中文回答。

${contextText}`

  try {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'glm-4.5-air',
        messages: [{ role: 'user', content: promptText }],
        max_tokens: 140,
        temperature: 0.4,
        thinking: { type: 'disabled' },
        stream: false
      })
    })

    if (!response.ok) {
      console.error('[AI Service] Focus API request failed:', response.status)
      return fallback()
    }

    const data = await response.json()
    console.log('[GLM focus response]', data)

    let recommendation = ''
    const messageContent = data?.choices?.[0]?.message?.content

    if (typeof messageContent === 'string') {
      recommendation = messageContent.trim()
    } else if (Array.isArray(messageContent)) {
      const textItem = messageContent.find(item => item?.type === 'text')
      recommendation = textItem?.text?.trim() || ''
    }

    if (!recommendation) {
      console.error('[AI Service] Focus invalid API response')
      return fallback()
    }

    console.log('[AI Service] GLM focus recommendation generated')
    return { recommendation }

  } catch (error) {
    console.error('[AI Service] Focus API call error:', error.message)
    return fallback()
  }
}

export async function generateActionPlan(notes, projects, focusText) {
  const API_KEY = import.meta.env.VITE_GLM_API_KEY

  const fallback = () => {
    const inProgressProjects = projects?.filter(p => p.status === 'in_progress').length || 0
    const notesCount = notes?.length || 0
    const onHoldProjects = projects?.filter(p => p.status === 'on_hold').length || 0

    const actions = [
      `Resolve blockers in ${inProgressProjects} active project${inProgressProjects !== 1 ? 's' : ''}`,
      `Review ${notesCount} recent note${notesCount !== 1 ? 's' : ''} and convert useful ones into tasks`,
      'Revisit stalled items before Friday'
    ]
    console.log('[AI Service] Fallback to mock action plan:', actions)
    return { actions }
  }

  if (!API_KEY) {
    console.error('[AI Service] VITE_GLM_API_KEY not found, using fallback')
    return fallback()
  }

  // Compress input context
  const recentNotes = (notes || []).slice(0, 5).map(n => {
    const title = n.title || '(无标题)'
    const content = (n.content || '').slice(0, 100)
    return `笔记：${title} - ${content}`
  }).join('\n')

  const recentProjects = (projects || []).slice(0, 3).map(p => {
    const name = p.name || '(无项目名)'
    const summary = p.summary || '(无描述)'
    return `项目：${name} - ${summary}`
  }).join('\n')

  const contextText = `最近笔记：\n${recentNotes || '(无)'}\n\n最近项目：\n${recentProjects || '(无)'}`

  // Mode selection: focus-driven or context-only
  const hasFocus = focusText && focusText.trim().length > 0
  let promptText = ''

  if (hasFocus) {
    // Mode 1: Focus-driven prompt
    promptText = `始终使用简体中文输出。保留必要英文技术术语。

基于以下 Focus 方向和当前推进情况，生成 3 条可执行 action plan：
Focus：${focusText}

每条 action 必须包含：
- 一个具体动作
- 明确目标对象
- 可在当前轮开发中执行

避免空泛建议。Action 应紧密围绕 Focus 方向。

用换行分隔 3 条 action，每条一行。

${contextText}`
  } else {
    // Mode 2: Context-only prompt
    promptText = `始终使用简体中文输出。保留必要英文技术术语。

基于以下当前推进情况，生成 3 条可执行 action plan：
每条 action 必须包含：
- 一个具体动作
- 明确目标对象
- 可在当前轮开发中执行

避免空泛建议。

用换行分隔 3 条 action，每条一行。

${contextText}`
  }

  console.log(`[AI Service] Action Plan mode: ${hasFocus ? 'focus-driven' : 'context-only'}`)

  try {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'glm-4.5-air',
        messages: [{ role: 'user', content: promptText }],
        max_tokens: 180,
        temperature: 0.4,
        thinking: { type: 'disabled' },
        stream: false
      })
    })

    if (!response.ok) {
      console.error('[AI Service] Action Plan API request failed:', response.status)
      return fallback()
    }

    const data = await response.json()
    console.log('[GLM action plan response]', data)

    let actionsText = ''
    const messageContent = data?.choices?.[0]?.message?.content

    if (typeof messageContent === 'string') {
      actionsText = messageContent.trim()
    } else if (Array.isArray(messageContent)) {
      const textItem = messageContent.find(item => item?.type === 'text')
      actionsText = textItem?.text?.trim() || ''
    }

    if (!actionsText) {
      console.error('[AI Service] Action Plan invalid API response')
      return fallback()
    }

    // Parse actions by newlines, filter empty lines, remove numbering
    const actions = actionsText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[0-9]+[.、]\s*/, '')) // remove numbering
      .filter(line => line.length > 0)
      .slice(0, 3)

    console.log('[AI Service] GLM action plan generated')
    return { actions }

  } catch (error) {
    console.error('[AI Service] Action Plan API call error:', error.message)
    return fallback()
  }
}

export async function generateTasksFromNote(note) {
  const API_KEY = import.meta.env.VITE_GLM_API_KEY

  const fallback = () => {
    const drafts = [
      { title: `基于 "${note.title}" 的下一步`, source: 'note' },
      { title: `整理 "${note.title}" 的关键点`, source: 'note' },
      { title: `扩展 "${note.title}" 内容`, source: 'note' }
    ]
    console.log('[AI Service] Fallback to mock note tasks:', drafts)
    return { drafts }
  }

  if (!API_KEY) {
    console.error('[AI Service] VITE_GLM_API_KEY not found, using fallback')
    return fallback()
  }

  const title = note?.title || '(无标题)'
  const content = (note?.content || '').slice(0, 300)
  const promptText = `始终使用简体中文输出。

基于以下笔记内容，生成 1~2 条可直接执行的 task draft：
笔记标题：${title}
笔记内容：${content}

要求：
- 每条 task 必须可直接保存为 Task.title
- 不带编号
- 不带解释文本
- 简体中文，动作导向
- 适合从这条 note 延伸的任务
- 与 note 相关或基于 note 内容扩展

用换行分隔 1~2 条 task，每条一行。`

  try {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'glm-4.5-air',
        messages: [{ role: 'user', content: promptText }],
        max_tokens: 60,
        temperature: 0.3,
        thinking: { type: 'disabled' },
        stream: false
      })
    })

    if (!response.ok) {
      console.error('[AI Service] Note Tasks API request failed:', response.status)
      return fallback()
    }

    const data = await response.json()
    console.log('[GLM note tasks response]', data)

    let tasksText = ''
    const messageContent = data?.choices?.[0]?.message?.content

    if (typeof messageContent === 'string') {
      tasksText = messageContent.trim()
    } else if (Array.isArray(messageContent)) {
      const textItem = messageContent.find(item => item?.type === 'text')
      tasksText = textItem?.text?.trim() || ''
    }

    if (!tasksText) {
      console.error('[AI Service] Note Tasks invalid API response')
      return fallback()
    }

    const tasks = tasksText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, 2)

    console.log('[AI Service] GLM note tasks generated')
    return { drafts: tasks }
  } catch (error) {
    console.error('[AI Service] Note Tasks API call error:', error.message)
    return fallback()
  }
}

export async function generateTaskDrafts(notes, projects, actionPlan) {
  const API_KEY = import.meta.env.VITE_GLM_API_KEY

  const fallback = () => {
    const drafts = [
      { title: '整理当前上下文并明确下一步', source: 'dashboard', generationMode: 'context_only' },
      { title: '回顾最近笔记并提取可执行任务', source: 'dashboard', generationMode: 'context_only' },
      { title: '检查活跃项目中的阻塞项', source: 'dashboard', generationMode: 'context_only' }
    ]
    console.log('[AI Service] Fallback to mock task drafts:', drafts)
    return { drafts }
  }

  if (!API_KEY) {
    console.error('[AI Service] VITE_GLM_API_KEY not found, using fallback')
    return fallback()
  }

  // Compress input context
  const recentNotes = (notes || []).slice(0, 5).map(n => {
    const title = n.title || '(无标题)'
    const content = (n.content || '').slice(0, 100)
    return `笔记：${title} - ${content}`
  }).join('\n')

  const recentProjects = (projects || []).slice(0, 3).map(p => {
    const name = p.name || '(无项目名)'
    const summary = p.summary || '(无描述)'
    return `项目：${name} - ${summary}`
  }).join('\n')

  const contextText = `最近笔记：\n${recentNotes || '(无)'}\n\n最近项目：\n${recentProjects || '(无)'}`

  // Mode selection: action-plan-driven or context-only
  const hasActionPlan = actionPlan && Array.isArray(actionPlan) && actionPlan.length > 0
  let promptText = ''

  if (hasActionPlan) {
    // Mode 1: Action plan driven prompt
    const actionPlanText = actionPlan.map((a, i) => `${i + 1}. ${a}`).join('\n')
    promptText = `始终使用简体中文输出。保留必要英文技术术语。

以下 action plan 是当前已确定的执行计划：
${actionPlanText}

请将其拆成 3 条可直接保存的 task drafts，不要扩散到其他低优先级事项。
- 每条 task 必须可直接保存为 Task.title
- 不带编号
- 不带解释文本
- 简体中文，动作导向
- 适合 checklist 展示

用换行分隔 3 条 task，每条一行。

${contextText}`
  } else {
    // Mode 2: Context-only prompt
    promptText = `始终使用简体中文输出。保留必要英文技术术语。

基于以下当前推进情况，生成 3 条可直接保存的 task drafts：
- 每条 task 必须可直接保存为 Task.title
- 不带编号
- 不带解释文本
- 简体中文，动作导向
- 适合 checklist 展示

用换行分隔 3 条 task，每条一行。

${contextText}`
  }

  console.log(`[AI Service] Task Drafts mode: ${hasActionPlan ? 'action-plan-driven' : 'context-only'}`)

  try {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'glm-4.5-air',
        messages: [{ role: 'user', content: promptText }],
        max_tokens: 120,
        temperature: 0.3,
        thinking: { type: 'disabled' },
        stream: false
      })
    })

    if (!response.ok) {
      console.error('[AI Service] Task Drafts API request failed:', response.status)
      return fallback()
    }

    const data = await response.json()
    console.log('[GLM task drafts response]', data)

    let draftsText = ''
    const messageContent = data?.choices?.[0]?.message?.content

    if (typeof messageContent === 'string') {
      draftsText = messageContent.trim()
    } else if (Array.isArray(messageContent)) {
      const textItem = messageContent.find(item => item?.type === 'text')
      draftsText = textItem?.text?.trim() || ''
    }

    if (!draftsText) {
      console.error('[AI Service] Task Drafts invalid API response')
      return fallback()
    }

    // Parse tasks: remove numbering, filter empty
    const taskTitles = draftsText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[0-9]+[.、]\s*/, '')) // remove numbering
      .filter(line => line.length > 0)
      .slice(0, 3)

    // Assign default source and generationMode to all drafts
    const generationMode = hasActionPlan ? 'action_plan' : 'context_only'
    const drafts = taskTitles.map(title => ({
      title,
      source: 'dashboard',
      generationMode
    }))

    console.log('[AI Service] GLM task drafts generated')
    return { drafts }

  } catch (error) {
    console.error('[AI Service] Task Drafts API call error:', error.message)
    return fallback()
  }
}
