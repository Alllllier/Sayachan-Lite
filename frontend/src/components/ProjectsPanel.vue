<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue'
import { useAuthStore } from '../stores/auth'
import type { AuthStore } from '../stores/auth'
import { useProjectsFeature } from '../features/projects/useProjectsFeature.js'
import {
  PROJECT_TASK_PREVIEW_LIMIT,
  canSetProjectFocus,
  getProjectArchivedPreviewTasks,
  getProjectPrimaryPreviewTasks,
  getProjectTaskBuckets
} from '../features/projects/projects.rules'
import {
  Card,
  CardHeaderRow,
  CardMetaRow,
  DirectiveBlock,
  SectionBlock,
  ActionRow,
  ObjectActionArea
} from './ui/surfaces'
import { CardCollection, CollectionCaptureSurface } from './ui/shell'
import Toast from './ui/Toast.vue'
import EmptyState from './ui/EmptyState.vue'
import OverflowMenu from './ui/OverflowMenu.vue'
import SegmentedControl from './ui/SegmentedControl.vue'
import {
  List,
  ListSection,
  ListItem,
  ItemContent,
  ItemMeta
} from './ui/list'
import type { ProjectDto, ProjectStatus } from '@sayachan/contracts'
import type { TaskApiTask } from '../services/tasks/task.rules'
import { t } from '../i18n/productLocale'

type ToastType = 'success' | 'error'
type PreviewFilter = 'active' | 'completed'
type ProjectPreviewFilterMap = Record<string, PreviewFilter>
type ProjectWithId = ProjectDto & { _id: string }
type StatusLabelMap = Record<ProjectStatus, string>
type StatusClassMap = Record<ProjectStatus, string>

const menuOpenProjectId = ref<string | null>(null)
const projectCaptureOpen = ref(false)
const newProjectNameRef = ref<HTMLInputElement | null>(null)
const auth = useAuthStore() as AuthStore
const accountCacheKey = computed(() => auth.currentUser?._id || auth.currentUser?.email || 'anonymous')

// Project task preview expansion and filter state
const expandedPrimaryPreviewProjects = ref<Set<string>>(new Set())
const expandedArchivedPreviewProjects = ref<Set<string>>(new Set())
const previewFilter = ref<ProjectPreviewFilterMap>({})

// Toast notifications
const toast = ref(false)
const toastMessage = ref('')
const toastType = ref<ToastType>('success')

const archiveViewOptions = computed(() => [
  { value: 'active', label: t('common.active') },
  { value: 'archived', label: t('common.archived') }
])

const previewFilterOptions = computed(() => [
  { value: 'active', label: t('common.active') },
  { value: 'completed', label: t('common.completed') }
])

const taskCaptureModeOptions = computed(() => [
  { value: 'single', label: t('projects.single') },
  { value: 'batch', label: t('projects.batch') }
])

function normalizeToastType(type: string | undefined): ToastType {
  return type === 'error' ? 'error' : 'success'
}

function showToast(message: string, type?: string): void {
  toastMessage.value = message
  toastType.value = normalizeToastType(type)
  toast.value = true
  setTimeout(() => {
    toast.value = false
  }, 3000)
}

const emit = defineEmits<{
  refreshed: [projects: ProjectDto[]]
}>()

const {
  projects,
  projectForm,
  editingProjectId,
  loading,
  error,
  showArchived,
  aiSuggestions,
  savedSuggestions,
  addingManualTasks,
  manualTaskInputs,
  taskCaptureOpen,
  taskCaptureMode,
  batchTaskInputs,
  addingBatchTasks,
  taskCaptureErrors,
  projectTasks,
  projectFormErrors,
  editProjectErrors,
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  archiveProject,
  restoreProject,
  pinProject,
  unpinProject,
  startEditingProject,
  cancelEditProject,
  updateProjectFieldError,
  getCurrentFocusDisplay,
  handleTaskCaptureInput,
  openTaskCapture,
  closeTaskCapture,
  setTaskCaptureMode,
  addManualTask,
  addBatchTasks,
  closeAISuggestions,
  getProjectAIState,
  handleAISuggest,
  saveSuggestionAsTask,
  setTaskAsFocus,
  setProjectArchiveView
} = useProjectsFeature({
  cacheUserKey: accountCacheKey,
  notify: showToast,
  onRefreshed: refreshedProjects => emit('refreshed', refreshedProjects)
})

function projectId(project: ProjectDto): string {
  return String(project._id)
}

function editableProject(project: ProjectDto): ProjectWithId {
  return {
    ...project,
    _id: projectId(project)
  }
}

function toggleProjectMenu(id: string): void {
  if (menuOpenProjectId.value === id) {
    menuOpenProjectId.value = null
  } else {
    menuOpenProjectId.value = id
  }
}

function closeProjectMenu(): void {
  menuOpenProjectId.value = null
}

// Status mapping: internal enum → user-friendly language and color
function formatStatus(status: ProjectStatus): string {
  const statusMap: StatusLabelMap = {
    pending: t('projects.statusPending'),
    in_progress: t('projects.statusInProgress'),
    completed: t('projects.statusCompleted'),
    on_hold: t('projects.statusOnHold')
  }
  return statusMap[status]
}

function getStatusClass(status: ProjectStatus): string {
  const classMap: StatusClassMap = {
    pending: 'status-planning',
    in_progress: 'status-active',
    completed: 'status-completed',
    on_hold: 'status-paused'
  }
  return classMap[status]
}

onMounted(fetchProjects)

function getProjectTasks(id: string): TaskApiTask[] {
  return projectTasks.value[id] || []
}

function getActiveTasks(id: string): TaskApiTask[] {
  return getProjectTaskBuckets(getProjectTasks(id)).active
}

function getCompletedTasks(id: string): TaskApiTask[] {
  return getProjectTaskBuckets(getProjectTasks(id)).completed
}

function getArchivedTasks(id: string): TaskApiTask[] {
  return getProjectTaskBuckets(getProjectTasks(id)).archived
}

function hasPrimaryTaskSection(id: string): boolean {
  const { active, completed } = getProjectTaskBuckets(getProjectTasks(id))
  return active.length > 0 || completed.length > 0
}

function getPreviewFilter(id: string): PreviewFilter {
  return previewFilter.value[id] || 'active'
}

function getPrimaryPreviewTaskTotal(id: string): number {
  const buckets = getProjectTaskBuckets(getProjectTasks(id))
  return getPreviewFilter(id) === 'completed'
    ? buckets.completed.length
    : buckets.active.length
}

function getArchivedPreviewTaskTotal(id: string): number {
  return getProjectTaskBuckets(getProjectTasks(id)).archived.length
}

function getProjectPreviewToggleLabel(isExpanded: boolean, total: number): string {
  if (isExpanded) {
    return t('common.showLess')
  }
  return total > PROJECT_TASK_PREVIEW_LIMIT ? t('common.showAll', { total }) : t('common.expandDetails')
}

function getPrimaryPreviewTasks(id: string): TaskApiTask[] {
  const project = projects.value.find(p => p._id === id)
  return getProjectPrimaryPreviewTasks(
    project,
    getProjectTasks(id),
    getPreviewFilter(id),
    expandedPrimaryPreviewProjects.value.has(id)
  )
}

function getArchivedPreviewTasks(id: string): TaskApiTask[] {
  const project = projects.value.find(p => p._id === id)
  return getProjectArchivedPreviewTasks(
    project,
    getProjectTasks(id),
    expandedArchivedPreviewProjects.value.has(id)
  )
}

function togglePrimaryProjectPreview(id: string): void {
  if (expandedPrimaryPreviewProjects.value.has(id)) {
    expandedPrimaryPreviewProjects.value.delete(id)
  } else {
    expandedPrimaryPreviewProjects.value.add(id)
  }
}

function toggleArchivedProjectPreview(id: string): void {
  if (expandedArchivedPreviewProjects.value.has(id)) {
    expandedArchivedPreviewProjects.value.delete(id)
  } else {
    expandedArchivedPreviewProjects.value.add(id)
  }
}

function setPreviewFilter(id: string, filter: PreviewFilter): void {
  previewFilter.value[id] = filter
}

function setPreviewFilterValue(id: string, filter: string): void {
  if (filter === 'active' || filter === 'completed') {
    setPreviewFilter(id, filter)
  }
}

function isFocusTask(project: ProjectDto, task: TaskApiTask): boolean {
  return String(project.currentFocusTaskId) === String(task._id)
}

function getArchivedSectionTitle(project: ProjectDto): string {
  return project?.archived ? t('projects.archivedTasks') : t('projects.archivedShort')
}

async function updateEditableProject(project: ProjectDto): Promise<void> {
  await updateProject(editableProject(project))
}

function startEditableProject(project: ProjectDto): void {
  startEditingProject(editableProject(project))
}

function cancelEditableProject(project: ProjectDto): void {
  cancelEditProject(editableProject(project))
}

async function archiveEditableProject(project: ProjectDto): Promise<void> {
  await archiveProject(editableProject(project))
}

async function restoreEditableProject(project: ProjectDto): Promise<void> {
  await restoreProject(editableProject(project))
}

async function pinEditableProject(project: ProjectDto): Promise<void> {
  await pinProject(editableProject(project))
}

async function unpinEditableProject(project: ProjectDto): Promise<void> {
  await unpinProject(editableProject(project))
}

async function addManualProjectTask(project: ProjectDto): Promise<void> {
  await addManualTask(editableProject(project))
}

async function addBatchProjectTasks(project: ProjectDto): Promise<void> {
  await addBatchTasks(editableProject(project))
}

async function suggestProjectNextActions(project: ProjectDto): Promise<void> {
  await handleAISuggest(editableProject(project))
}

async function setProjectFocusTask(project: ProjectDto, task: TaskApiTask): Promise<void> {
  await setTaskAsFocus(editableProject(project), task)
}

function openProjectCapture(): void {
  projectCaptureOpen.value = true
  void nextTick(() => {
    newProjectNameRef.value?.focus()
  })
}

function closeProjectCapture({ reset = false } = {}): void {
  projectCaptureOpen.value = false
  if (reset) {
    projectForm.value = { name: '', summary: '', status: 'pending' }
    projectFormErrors.value = { name: '', summary: '' }
  }
}

function cancelProjectCapture(): void {
  closeProjectCapture({ reset: true })
}

async function submitProjectCapture(): Promise<void> {
  await createProject()
  if (!projectFormErrors.value.name && !projectFormErrors.value.summary && !projectForm.value.name && !projectForm.value.summary) {
    closeProjectCapture()
  }
}

</script>

<template>
  <!-- Toast Notification -->
  <Toast :message="toastMessage" :type="toastType" :visible="toast" />

  <div v-if="error" class="error">{{ error }}</div>

  <CollectionCaptureSurface
    :open="projectCaptureOpen"
    :title="t('projects.newTitle')"
    title-id="project-capture-title"
    :close-label="t('projects.closeNew')"
    @close="cancelProjectCapture"
  >
        <div class="field-stack">
          <input
            ref="newProjectNameRef"
            v-model="projectForm.name"
            :placeholder="t('projects.namePlaceholder')"
            class="input"
            :class="{ 'is-invalid': projectFormErrors.name }"
            :disabled="loading"
            :aria-invalid="Boolean(projectFormErrors.name)"
            @input="updateProjectFieldError('new', 'name', projectForm.name)"
          />
          <p v-if="projectFormErrors.name" class="field-helper field-helper--error">{{ projectFormErrors.name }}</p>
        </div>
        <div class="field-stack">
          <textarea
            v-model="projectForm.summary"
            :placeholder="t('projects.summaryPlaceholder')"
            rows="2"
            class="textarea"
            :class="{ 'is-invalid': projectFormErrors.summary }"
            :disabled="loading"
            :aria-invalid="Boolean(projectFormErrors.summary)"
            @input="updateProjectFieldError('new', 'summary', projectForm.summary)"
          ></textarea>
          <p v-if="projectFormErrors.summary" class="field-helper field-helper--error">{{ projectFormErrors.summary }}</p>
        </div>
        <div class="field-stack">
          <select v-model="projectForm.status" class="input" :disabled="loading" :aria-label="t('projects.statusLabel')">
            <option value="pending">{{ t('projects.statusPending') }}</option>
            <option value="in_progress">{{ t('projects.statusInProgress') }}</option>
            <option value="completed">{{ t('projects.statusCompleted') }}</option>
            <option value="on_hold">{{ t('projects.statusOnHold') }}</option>
          </select>
        </div>
    <template #actions>
        <ActionRow>
          <button type="button" @click="cancelProjectCapture" :disabled="loading" class="btn btn-secondary">
            {{ t('common.cancel') }}
          </button>
          <button type="button" @click="submitProjectCapture" :disabled="loading" class="btn btn-primary">
            {{ loading ? t('common.saving') : t('projects.addProject') }}
          </button>
        </ActionRow>
    </template>
  </CollectionCaptureSurface>

  <CardCollection class="projects-collection" embedded>
    <template #title>
      {{ t('projects.title', { count: projects.length }) }}
    </template>
    <template #command>
      <SegmentedControl
        :model-value="showArchived ? 'archived' : 'active'"
        :options="archiveViewOptions"
        variant="page"
        :aria-label="t('projects.archiveViewLabel')"
        @update:model-value="setProjectArchiveView"
      />
    </template>
    <template #control>
      <button
        type="button"
        class="btn btn-primary btn-sm project-create-command"
        :aria-label="t('projects.createLabel')"
        @click="openProjectCapture"
      >
        <span aria-hidden="true">+</span>
        <span>{{ t('common.new') }}</span>
      </button>
    </template>
    <EmptyState v-if="projects.length === 0" :title="showArchived ? t('projects.emptyArchivedTitle') : t('projects.emptyActiveTitle')" />
    <Card
      v-for="project in projects"
      :key="project._id"
      :state="project.archived ? 'archived' : null"
      @click="closeProjectMenu"
    >
      <template #header>
        <CardHeaderRow :title="project.name">
          <template #actions>
          <button
            v-if="!project.archived"
            @click.stop="project.isPinned ? unpinEditableProject(project) : pinEditableProject(project)"
            class="panel-surface-icon-btn"
            :class="{ pinned: project.isPinned }"
            :title="project.isPinned ? t('projects.unpin') : t('projects.pin')"
          >
            <svg v-if="project.isPinned" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z"/>
            </svg>
            <svg v-else class="icon-stroke" viewBox="0 0 24 24">
              <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z"/>
            </svg>
          </button>
          </template>
        </CardHeaderRow>
      </template>

      <template #meta>
        <CardMetaRow>
          <span class="status-badge" :class="getStatusClass(project.status)">{{ formatStatus(project.status) }}</span>
          <template #date>{{ new Date(project.updatedAt).toLocaleDateString() }}</template>
        </CardMetaRow>
      </template>

      <template #body>
        <div v-if="editingProjectId === project._id && !project.archived" class="project-edit-form">
          <div class="field-stack">
            <input
              v-model="project.name"
              :placeholder="t('projects.namePlaceholder')"
              class="input"
              :class="{ 'is-invalid': editProjectErrors[project._id]?.name }"
              :disabled="loading"
              :aria-invalid="Boolean(editProjectErrors[project._id]?.name)"
              @input="updateProjectFieldError('edit', 'name', project.name, project._id)"
            />
            <p v-if="editProjectErrors[project._id]?.name" class="field-helper field-helper--error">
              {{ editProjectErrors[project._id].name }}
            </p>
          </div>
          <div class="field-stack">
            <textarea
              v-model="project.summary"
              :placeholder="t('projects.summaryPlaceholder')"
              rows="2"
              class="textarea"
              :class="{ 'is-invalid': editProjectErrors[project._id]?.summary }"
              :disabled="loading"
              :aria-invalid="Boolean(editProjectErrors[project._id]?.summary)"
              @input="updateProjectFieldError('edit', 'summary', project.summary, project._id)"
            ></textarea>
            <p v-if="editProjectErrors[project._id]?.summary" class="field-helper field-helper--error">
              {{ editProjectErrors[project._id].summary }}
            </p>
          </div>
          <div class="field-stack">
            <select v-model="project.status" class="input" :disabled="loading">
              <option value="pending">{{ t('projects.statusPending') }}</option>
              <option value="in_progress">{{ t('projects.statusInProgress') }}</option>
              <option value="completed">{{ t('projects.statusCompleted') }}</option>
              <option value="on_hold">{{ t('projects.statusOnHold') }}</option>
            </select>
          </div>
        </div>
        <template v-else>
          <p class="card-content">{{ project.summary }}</p>

          <DirectiveBlock>
            <div class="focus-section">
              <div class="focus-main">
                <span class="focus-label">{{ t('projects.currentFocus') }}</span>
                <span class="focus-value">{{ getCurrentFocusDisplay(project) || t('projects.noActiveFocus') }}</span>
              </div>
            </div>
          </DirectiveBlock>

          <DirectiveBlock
            v-if="getActiveTasks(project._id).length > 0 || getCompletedTasks(project._id).length > 0 || getArchivedTasks(project._id).length > 0"
          >
            <List
              mode="preview"
            >
              <ListSection
                  v-if="!project.archived && hasPrimaryTaskSection(project._id)"
                  class="project-task-section"
                  :class="{ 'is-expanded': expandedPrimaryPreviewProjects.has(project._id) }"
                  :aria-label="t('projects.tasksAria', { filter: getPreviewFilter(project._id) })"
                >
                  <template #title>
                    <div class="project-task-section-heading">
                      <span class="project-task-section-heading-text">{{ t('projects.tasks') }}</span>
                      <SegmentedControl
                        :model-value="getPreviewFilter(project._id)"
                        :options="previewFilterOptions"
                        variant="inline"
                        :aria-label="t('projects.taskPreviewFilterLabel')"
                        @update:model-value="setPreviewFilterValue(project._id, $event)"
                      />
                    </div>
                  </template>
                  <template #control>
                    <button
                      @click.stop="togglePrimaryProjectPreview(project._id)"
                      class="btn btn-ghost btn-sm preview-toggle-btn"
                      :aria-expanded="expandedPrimaryPreviewProjects.has(project._id)"
                    >
                      {{ getProjectPreviewToggleLabel(expandedPrimaryPreviewProjects.has(project._id), getPrimaryPreviewTaskTotal(project._id)) }}
                    </button>
                  </template>

                  <ListItem
                    v-for="task in getPrimaryPreviewTasks(project._id)"
                    :key="task._id"
                    :element="canSetProjectFocus(task) ? 'button' : 'div'"
                    :interactive="canSetProjectFocus(task)"
                    :current="isFocusTask(project, task)"
                    :muted="task.status === 'completed'"
                    :aria-pressed="canSetProjectFocus(task) ? isFocusTask(project, task) : undefined"
                    @click.stop="canSetProjectFocus(task) ? setProjectFocusTask(project, task) : null"
                  >
                    <ItemContent :text="task.title" />
                    <ItemMeta v-if="isFocusTask(project, task)">
                      <span class="focus-badge">{{ t('projects.currentFocus') }}</span>
                    </ItemMeta>
                  </ListItem>
                </ListSection>

                <ListSection
                  v-if="getArchivedPreviewTasks(project._id).length > 0"
                  class="project-task-section project-task-section-archived"
                  :class="{
                    'is-expanded': expandedArchivedPreviewProjects.has(project._id),
                    'project-task-section-separated': hasPrimaryTaskSection(project._id)
                  }"
                  :title="getArchivedSectionTitle(project)"
                  :aria-label="getArchivedSectionTitle(project)"
                >
                  <template #control>
                    <button
                      @click.stop="toggleArchivedProjectPreview(project._id)"
                      class="btn btn-ghost btn-sm preview-toggle-btn"
                      :aria-expanded="expandedArchivedPreviewProjects.has(project._id)"
                    >
                      {{ getProjectPreviewToggleLabel(expandedArchivedPreviewProjects.has(project._id), getArchivedPreviewTaskTotal(project._id)) }}
                    </button>
                  </template>

                  <ListItem
                    v-for="task in getArchivedPreviewTasks(project._id)"
                    :key="task._id"
                    :archived="true"
                    :current="isFocusTask(project, task)"
                    :muted="task.status === 'completed'"
                  >
                    <ItemContent :text="task.title" />
                    <ItemMeta v-if="!project.archived || isFocusTask(project, task)">
                      <span
                        v-if="!project.archived"
                        class="task-preview-state-chip"
                        :class="task.status === 'completed' ? 'state-completed' : 'state-active'"
                      >
                          {{ task.status === 'completed' ? t('common.completed') : t('common.active') }}
                      </span>
                      <span v-if="isFocusTask(project, task)" class="focus-badge">{{ t('projects.currentFocus') }}</span>
                    </ItemMeta>
                  </ListItem>
                </ListSection>
            </List>
          </DirectiveBlock>

        </template>
      </template>

      <template #actions v-if="editingProjectId === project._id && !project.archived">
        <ActionRow>
          <button @click="cancelEditableProject(project)" :disabled="loading" class="btn btn-secondary">{{ t('common.cancel') }}</button>
          <button @click="updateEditableProject(project)" :disabled="loading" class="btn btn-primary">{{ t('common.save') }}</button>
        </ActionRow>
      </template>

      <template #actions v-else>
        <ObjectActionArea
          v-if="!project.archived"
          variant="primary"
          :state="taskCaptureOpen.has(project._id) ? 'active' : 'idle'"
          :idle-label="t('projects.addTask')"
          :active-label="t('common.cancel')"
          :button-class="'add-task-btn'"
          @activate="openTaskCapture(project._id)"
          @cancel="closeTaskCapture(project._id)"
        >
          <SectionBlock class="task-capture-area">
            <SegmentedControl
              class="capture-mode-switch"
              :model-value="taskCaptureMode[project._id]"
              :options="taskCaptureModeOptions"
              variant="mode"
              :aria-label="t('projects.taskCaptureModeLabel')"
              @update:model-value="setTaskCaptureMode(project._id, $event)"
            />

            <div v-if="taskCaptureMode[project._id] === 'single'" class="single-task-input">
              <div class="field-stack">
                <input
                  v-model="manualTaskInputs[project._id]"
                  :placeholder="t('projects.taskTitlePlaceholder')"
                  @keyup.enter="addManualProjectTask(project)"
                  :disabled="addingManualTasks.has(project._id)"
                  class="input"
                  :class="{ 'is-invalid': taskCaptureErrors[project._id]?.single }"
                  :aria-invalid="Boolean(taskCaptureErrors[project._id]?.single)"
                  @input="handleTaskCaptureInput(project._id, 'single', manualTaskInputs[project._id] || '')"
                />
                <p v-if="taskCaptureErrors[project._id]?.single" class="field-helper field-helper--error">
                  {{ taskCaptureErrors[project._id].single }}
                </p>
              </div>
              <div class="manual-task-actions">
                <button @click="addManualProjectTask(project)" class="btn btn-primary btn-sm" :disabled="addingManualTasks.has(project._id)">
                  {{ addingManualTasks.has(project._id) ? t('common.saving') : t('common.save') }}
                </button>
              </div>
            </div>

            <div v-if="taskCaptureMode[project._id] === 'batch'" class="batch-task-input">
              <div class="field-stack">
                <textarea
                  v-model="batchTaskInputs[project._id]"
                  :placeholder="t('projects.batchTaskPlaceholder')"
                  :disabled="addingBatchTasks.has(project._id)"
                  class="textarea"
                  :class="{ 'is-invalid': taskCaptureErrors[project._id]?.batch }"
                  :aria-invalid="Boolean(taskCaptureErrors[project._id]?.batch)"
                  rows="3"
                  @input="handleTaskCaptureInput(project._id, 'batch', batchTaskInputs[project._id] || '')"
                ></textarea>
                <p v-if="taskCaptureErrors[project._id]?.batch" class="field-helper field-helper--error">
                  {{ taskCaptureErrors[project._id].batch }}
                </p>
              </div>
              <div class="batch-task-actions">
                <button @click="addBatchProjectTasks(project)" class="btn btn-primary btn-sm" :disabled="addingBatchTasks.has(project._id)">
                  {{ addingBatchTasks.has(project._id) ? t('common.saving') : t('projects.saveAll') }}
                </button>
              </div>
            </div>
          </SectionBlock>
        </ObjectActionArea>

        <template v-if="project.archived">
          <ActionRow>
            <button @click="restoreEditableProject(project)" class="btn btn-secondary">{{ t('common.restore') }}</button>
            <button @click="deleteProject(project._id)" class="btn btn-danger">{{ t('common.delete') }}</button>
          </ActionRow>
        </template>
        <ObjectActionArea
          v-else
          variant="ai"
          active-kind="icon"
          :state="getProjectAIState(project._id)"
          @activate="suggestProjectNextActions(project)"
          @cancel="closeAISuggestions(project._id)"
        >
          <template #idle-icon>
            <svg class="icon-stroke" viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
          </template>
          <template #trailing>
            <OverflowMenu
              :open="menuOpenProjectId === project._id"
              :title="t('common.actions')"
              @toggle="toggleProjectMenu(project._id)"
            >
              <button @click="startEditableProject(project)" class="btn btn-menu-item btn-secondary">{{ t('common.edit') }}</button>
              <button @click="archiveEditableProject(project)" class="btn btn-menu-item btn-archive">{{ t('common.archive') }}</button>
              <button @click="deleteProject(project._id)" class="btn btn-menu-item btn-danger">{{ t('common.delete') }}</button>
            </OverflowMenu>
          </template>
          <SectionBlock v-if="aiSuggestions[project._id] && aiSuggestions[project._id].length > 0" class="ai-suggestions project-ai-suggestions">
            <div class="ai-suggestions-header">
              <strong>{{ t('projects.aiSuggestionsTitle', { count: aiSuggestions[project._id].length }) }}</strong>
            </div>
            <div v-for="(suggestion, idx) in aiSuggestions[project._id]" :key="idx" class="ai-suggestion-item">
              <div class="suggestion-content">{{ suggestion }}</div>
              <div class="suggestion-actions">
                <button @click="saveSuggestionAsTask(project._id, suggestion)" class="btn btn-secondary btn-sm" :disabled="savedSuggestions.has(suggestion)">
                  {{ savedSuggestions.has(suggestion) ? t('common.saved') : t('notes.saveAsTask') }}
                </button>
              </div>
            </div>
          </SectionBlock>
        </ObjectActionArea>
      </template>
    </Card>
  </CardCollection>
</template>

<style scoped>
.projects-collection :deep(.card-collection-header) {
  position: sticky;
  top: 0;
  z-index: 40;
  padding: var(--space-md);
  background: color-mix(in srgb, var(--surface-panel) 84%, transparent);
  backdrop-filter: blur(12px);
}

.project-create-command {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

/* Project focus */
.focus-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  background: linear-gradient(135deg, var(--surface-card) 0%, var(--surface-hover) 100%);
  border-radius: var(--radius-block);
}

.focus-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 4px;
}

.focus-label {
  font-size: var(--font-size-meta);
  font-weight: var(--font-weight-medium);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.focus-value {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  line-height: 1.4;
}

/* Project meta */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-chip);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-planning {
  background: var(--identity-primary-soft);
  color: var(--text-emphasis);
}

.status-active {
  background: rgba(218, 165, 32, 0.12);
  color: #8e6514;
}

.status-completed {
  background: var(--surface-hover);
  color: var(--text-secondary);
}

.status-paused {
  background: var(--surface-panel);
  color: var(--text-muted);
}

/* Project task capture */
.add-task-btn {
  height: 40px;
  line-height: 1;  
  flex: 1 1 0;
  min-width: 90px;
  white-space: nowrap;
}

/* Legacy AI suggestions: parked until AI reveal/list cleanup. */
.ai-suggestions-header {
  margin-bottom: 8px;
}

.ai-suggestion-item {
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  background: white;
  border-radius: 4px;
  margin-bottom: 8px;
  gap: 10px;
}

.ai-suggestion-item:last-child {
  margin-bottom: 0;
}

.suggestion-content {
  font-size: 12px;
  color: #555;
  line-height: 1.5;
  word-break: break-word;
  overflow-wrap: break-word;
}

.suggestion-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* Legacy page-level error state */
.error {
  padding: var(--space-sm);
  background: color-mix(in srgb, var(--action-danger) 10%, var(--surface-card));
  color: var(--action-danger);
  border: 1px solid color-mix(in srgb, var(--action-danger) 35%, var(--border-default));
  border-radius: var(--radius-block);
  margin-bottom: var(--space-md);
  text-align: center;
}

.project-task-section-separated {
  padding-top: var(--space-sm);
  border-top: 1px dashed var(--border-default);
}

:deep(.project-task-section.is-expanded .item-content-text) {
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
}

.project-task-section-heading {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.project-task-section-heading-text {
  font-size: var(--font-size-section);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.task-preview-state-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-meta);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.2px;
}

.task-preview-state-chip.state-active {
  background: var(--identity-primary-soft);
  color: var(--text-emphasis);
}

.task-preview-state-chip.state-completed {
  background: var(--surface-hover);
  color: var(--text-secondary);
}

.manual-task-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.task-capture-area {
  margin-top: 8px;
  padding: var(--space-sm) var(--space-md) var(--space-md);
  background: var(--surface-panel);
  border-radius: var(--radius-block);
  border: 1px solid var(--border-default);
}

.capture-mode-switch {
  margin-bottom: 8px;
}

.single-task-input {
  padding: 0;
  background: transparent;
  border: none;
}

.batch-task-input {
  padding: 0;
  background: transparent;
  border: none;
}

.batch-task-input textarea {
  margin-bottom: 0;
  resize: none;
  overflow-y: auto;
  min-height: 80px;
  max-height: 400px;
  line-height: 1.5;
  field-sizing: content;
}

.batch-task-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.preview-toggle-btn {
  padding: 4px 10px;
  font-size: 11px;
}

.focus-badge {
  padding: 2px 8px;
  font-size: var(--font-size-meta);
  font-weight: var(--font-weight-medium);
  color: var(--text-emphasis);
  background: var(--identity-primary-soft);
  border-radius: var(--radius-full);
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Mobile: hide row-level focus badge; rely on top Current Focus section for semantics */
@media (max-width: 480px) {
  :deep(.project-task-section .item-meta) {
    display: none;
  }

  :deep(.list-item--current) .focus-badge {
    display: none;
  }
}

.project-edit-form {
  display: flex;
  flex-direction: column;
}

.project-ai-suggestions {
  margin-top: 0;
  background: var(--identity-primary-soft);
  border: 1px solid var(--border-default);
}

.project-ai-suggestions .ai-suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xs);
}

.project-ai-suggestions .ai-suggestion-item {
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-block);
}

.project-ai-suggestions .suggestion-content {
  color: var(--text-secondary);
}

</style>
