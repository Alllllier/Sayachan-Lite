// Dashboard AI helpers are currently fallback-only.
// Keep these functions stable so the frontend runtime does not depend on
// browser-side model calls while the broader AI architecture is being reworked.

function logFallback(name, payload) {
  console.log(`[AI Service] ${name} using local fallback`, payload)
}

export async function summarizeText(text) {
  const summary = text.slice(0, 50) + (text.length > 50 ? '...' : '') || 'Empty content'
  logFallback('summarizeText', summary)
  return { summary }
}

export async function generateWeeklyReview(notes, projects) {
  const notesCount = notes?.length || 0
  const projectsCount = projects?.length || 0
  const review = `This week you have ${notesCount} note${notesCount !== 1 ? 's' : ''} and ${projectsCount} project${projectsCount !== 1 ? 's' : ''} in progress. Focus next on active items.`
  logFallback('generateWeeklyReview', review)
  return { review }
}

export async function recommendFocus(notes, projects) {
  const inProgressProjects = projects?.filter(p => p.status === 'in_progress').length || 0
  const recentNotes = notes?.length || 0
  const recommendation = `Focus this week on ${inProgressProjects} active project${inProgressProjects !== 1 ? 's' : ''} and ${recentNotes} unresolved recent note${recentNotes !== 1 ? 's' : ''}.`
  logFallback('recommendFocus', recommendation)
  return { recommendation }
}

export async function generateActionPlan(notes, projects, focusText) {
  const inProgressProjects = projects?.filter(p => p.status === 'in_progress').length || 0
  const notesCount = notes?.length || 0
  const actions = [
    `Resolve blockers in ${inProgressProjects} active project${inProgressProjects !== 1 ? 's' : ''}`,
    `Review ${notesCount} recent note${notesCount !== 1 ? 's' : ''} and convert useful ones into tasks`,
    focusText?.trim() ? `Keep the current focus visible: ${focusText.trim()}` : 'Revisit stalled items before Friday'
  ]
  logFallback('generateActionPlan', actions)
  return { actions }
}

export async function generateTasksFromNote(note) {
  const drafts = [
    { title: `基于 "${note.title}" 的下一步`, source: 'note' },
    { title: `整理 "${note.title}" 的关键点`, source: 'note' },
    { title: `扩展 "${note.title}" 内容`, source: 'note' }
  ]
  logFallback('generateTasksFromNote', drafts)
  return { drafts }
}

export async function generateTaskDrafts(notes, projects, actionPlan) {
  const hasActionPlan = Array.isArray(actionPlan) && actionPlan.length > 0
  let drafts

  if (hasActionPlan) {
    drafts = actionPlan.slice(0, 3).map(title => ({
      title,
      source: 'dashboard',
      generationMode: 'action_plan'
    }))
  } else {
    drafts = [
      { title: '整理当前上下文并明确下一步', source: 'dashboard', generationMode: 'context_only' },
      { title: '回顾最近笔记并提取可执行任务', source: 'dashboard', generationMode: 'context_only' },
      { title: '检查活跃项目中的阻塞项', source: 'dashboard', generationMode: 'context_only' }
    ]
  }

  logFallback('generateTaskDrafts', drafts)
  return { drafts }
}
