/**
 * @typedef {'active' | 'completed' | 'archived' | (string & {})} TaskStatus
 *
 * @typedef {Object} TaskProvenance
 * @property {string} creationMode
 * @property {string} originModule
 * @property {string | null} originId
 *
 * @typedef {TaskProvenance & {
 *   title: string
 * }} TaskCreatePayload
 *
 * @typedef {Partial<{
 *   title: string
 *   status: TaskStatus
 *   archived: boolean
 *   completed: boolean
 *   creationMode: string
 *   originModule: string
 *   originId: string | null
 * }>} TaskUpdatePayload
 *
 * @typedef {TaskProvenance & {
 *   _id?: string
 *   title?: string
 *   status?: TaskStatus
 *   archived?: boolean
 *   completed?: boolean
 * }} TaskApiTask
 *
 * @typedef {TaskApiTask & {
 *   status: TaskStatus
 *   archived: boolean
 *   completed: boolean
 * }} NormalizedTask
 */

/**
 * @param {string} title
 * @param {string} creationMode
 * @param {string} [originModule]
 * @param {string | null} [originId]
 * @returns {TaskCreatePayload}
 */
export function buildTaskPayload(title, creationMode, originModule = '', originId = null) {
  return {
    title,
    creationMode,
    originModule,
    originId
  }
}

/**
 * @param {TaskApiTask | null | undefined} task
 * @returns {NormalizedTask | null | undefined}
 */
export function normalizeSavedTask(task) {
  if (task == null) return /** @type {null | undefined} */ (task)
  const status = task.status === undefined ? 'active' : task.status

  return /** @type {NormalizedTask} */ ({
    ...task,
    status,
    archived: task.archived === undefined ? false : task.archived,
    completed: task.completed === undefined ? status === 'completed' : task.completed
  })
}
