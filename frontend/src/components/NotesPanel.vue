<script setup lang="ts">
import { computed, ref, reactive, onMounted, nextTick, watch, onUnmounted } from 'vue'
import type { EditorView as CodeMirrorEditorView, ViewUpdate } from '@codemirror/view'
import 'highlight.js/styles/github.css'
import { renderMarkdown } from '../utils/markdown.js'
import { useNotesFeature } from '../features/notes/useNotesFeature.js'
import type { NoteDto } from '@sayachan/contracts'
import {
  Card,
  CardHeaderRow,
  CardMetaRow,
  SectionBlock,
  ActionRow,
  ObjectActionArea
} from './ui/surfaces'
import { CardCollection, CollectionCaptureSurface } from './ui/shell'
import Toast from './ui/Toast.vue'
import EmptyState from './ui/EmptyState.vue'
import OverflowMenu from './ui/OverflowMenu.vue'
import SegmentedControl from './ui/SegmentedControl.vue'
import { useAuthStore } from '../stores/auth'
import type { AuthStore } from '../stores/auth'
import { t } from '../i18n/productLocale'

type EditableNote = NoteDto & { _id: string }
type ToastType = 'success' | 'error'
type EditEditorMap = Record<string, CodeMirrorEditorView>
type CodeMirrorBundle = {
  view: typeof import('@codemirror/view')
  commands: typeof import('@codemirror/commands')
  language: typeof import('@codemirror/language')
  markdownModule: typeof import('@codemirror/lang-markdown')
}
type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number
}

let editorBundlePromise: Promise<CodeMirrorBundle> | null = null

const menuOpenNoteId = ref<string | null>(null)
const auth = useAuthStore() as AuthStore
const noteDraftStorageKey = computed(() => (
  `sayachan_note_drafts:${auth.currentUser?._id || auth.currentUser?.email || 'anonymous'}`
))
const accountCacheKey = computed(() => auth.currentUser?._id || auth.currentUser?.email || 'anonymous')

// Markdown editor refs
const newEditorRef = ref<HTMLElement | null>(null)
const newTitleRef = ref<HTMLInputElement | null>(null)
const newEditorView = ref<CodeMirrorEditorView | null>(null)
const editEditorViews = reactive<EditEditorMap>({})
const captureOpen = ref(false)
const editorLoading = ref(false)
const editorLoadError = ref('')

// Toast notifications
const toast = ref(false)
const toastMessage = ref('')
const toastType = ref<ToastType>('success')

const archiveViewOptions = computed(() => [
  { value: 'active', label: t('common.active') },
  { value: 'archived', label: t('common.archived') }
])

function noteId(note: NoteDto): string {
  return String(note._id)
}

function editableNote(note: NoteDto): EditableNote {
  return {
    ...note,
    _id: noteId(note)
  }
}

function clearNewEditor(): void {
  if (!newEditorView.value) return
  const doc = newEditorView.value.state.doc
  newEditorView.value.dispatch({
    changes: { from: 0, to: doc.length, insert: '' }
  })
}

function destroyNewEditor(): void {
  if (!newEditorView.value) return
  newEditorView.value.destroy()
  newEditorView.value = null
}

function destroyEditEditor(id: string | null | undefined): void {
  if (id && editEditorViews[id]) {
    editEditorViews[id].destroy()
    delete editEditorViews[id]
  }
}

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

function toggleNoteMenu(id: string): void {
  if (menuOpenNoteId.value === id) {
    menuOpenNoteId.value = null
  } else {
    menuOpenNoteId.value = id
  }
}

function closeNoteMenu(): void {
  menuOpenNoteId.value = null
}

const emit = defineEmits<{
  refreshed: [notes: NoteDto[]]
}>()

const {
  notes,
  form,
  editingId,
  loading,
  error,
  showArchived,
  aiTasksByNote,
  savedTaskDrafts,
  newNoteErrors,
  editNoteErrors,
  fetchNotes,
  createNote,
  updateNote: updateNoteFeature,
  deleteNote,
  archiveNote,
  restoreNote,
  pinNote,
  unpinNote,
  startEditing: startEditingFeature,
  cancelEdit: cancelEditFeature,
  updateNewNoteError,
  updateEditNoteError,
  closeAITasks,
  getNoteAIState,
  canUseNoteAction,
  setArchiveView,
  handleAIGenerateTasks,
  saveNoteTaskDraft,
  reloadDrafts
} = useNotesFeature({
  draftStorageKey: noteDraftStorageKey,
  cacheUserKey: accountCacheKey,
  notify: showToast,
  onRefreshed: refreshedNotes => emit('refreshed', refreshedNotes),
  onNoteCreated: clearNewEditor,
  onNoteUpdated: destroyEditEditor
})

watch(noteDraftStorageKey, () => {
  reloadDrafts()
})

function loadEditorBundle(): Promise<CodeMirrorBundle> {
  editorBundlePromise ??= Promise.all([
    import('@codemirror/view'),
    import('@codemirror/commands'),
    import('@codemirror/language'),
    import('@codemirror/lang-markdown')
  ]).then(([view, commands, language, markdownModule]) => ({
    view,
    commands,
    language,
    markdownModule
  }))
  return editorBundlePromise
}

function preloadEditorWhenIdle(): void {
  const preload = () => {
    void loadEditorBundle().catch(() => {
      editorBundlePromise = null
    })
  }
  const idleWindow = window as IdleWindow
  if (idleWindow.requestIdleCallback) {
    idleWindow.requestIdleCallback(preload, { timeout: 2500 })
    return
  }
  window.setTimeout(preload, 1200)
}

async function createCodeMirror(
  parent: HTMLElement,
  initialValue: string,
  onChange: (value: string) => void
): Promise<CodeMirrorEditorView> {
  const { view, commands, language, markdownModule } = await loadEditorBundle()
  const { EditorView, drawSelection, highlightSpecialChars, keymap } = view
  const { defaultKeymap, history, historyKeymap } = commands
  const { defaultHighlightStyle, syntaxHighlighting } = language
  const { markdown, markdownKeymap } = markdownModule

  return new EditorView({
    doc: initialValue || '',
    extensions: [
      history(),
      drawSelection(),
      highlightSpecialChars(),
      markdown({
        addKeymap: false,
        completeHTMLTags: false
      }),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      keymap.of([
        ...markdownKeymap,
        ...defaultKeymap,
        ...historyKeymap
      ]),
      EditorView.lineWrapping,
      EditorView.theme({
        '&': {
          fontSize: '14px',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--surface-card)',
          fontFamily: 'var(--font-family-base)',
          lineHeight: '1.6'
        },
        '&.cm-focused': {
          outline: 'none',
          borderColor: 'var(--border-focus)',
          boxShadow: '0 0 0 3px rgba(66, 184, 131, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04)'
        },
        '.cm-content': {
          minHeight: '120px',
          padding: 'var(--space-lg) var(--space-xl)'
        },
        '.cm-gutters': {
          display: 'none'
        },
        '.cm-line': {
          padding: '2px 0'
        },
        '.cm-activeLine': {
          backgroundColor: 'transparent'
        },
        '.cm-activeLineGutter': {
          backgroundColor: 'transparent'
        },
        '.cm-cursor': {
          borderLeftWidth: '2px',
          borderLeftColor: 'var(--text-primary)'
        },
        '.cm-placeholder': {
          color: 'var(--text-muted)'
        },
        '.cm-scroller': {
          fontFamily: 'inherit',
          lineHeight: 'inherit'
        },
        '.cm-selectionBackground': {
          background: 'rgba(66, 184, 131, 0.12)'
        },
        '.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground': {
          background: 'rgba(66, 184, 131, 0.18)'
        }
      }),
      EditorView.updateListener.of((update: ViewUpdate) => {
        if (update.docChanged) {
          const value = update.state.doc.toString()
          onChange(value)
          if (parent === newEditorRef.value) {
            updateNewNoteError('content', value)
          }
        }
      })
    ],
    parent
  })
}

async function mountNewEditor(): Promise<void> {
  await nextTick()
  const parent = newEditorRef.value
  if (!parent || newEditorView.value) return
  editorLoading.value = true
  editorLoadError.value = ''
  try {
    const editor = await createCodeMirror(parent, form.value.content || '', (val) => {
      form.value.content = val
    })
    if (!captureOpen.value || newEditorRef.value !== parent) {
      editor.destroy()
      return
    }
    newEditorView.value = editor
  } catch {
    editorBundlePromise = null
    editorLoadError.value = t('common.editorLoadFailed')
  } finally {
    editorLoading.value = false
  }
}

function openCapture(): void {
  captureOpen.value = true
  void mountNewEditor()
  void nextTick(() => {
    newTitleRef.value?.focus()
  })
}

function closeCapture({ reset = false } = {}): void {
  captureOpen.value = false
  destroyNewEditor()
  if (reset) {
    form.value = { title: '', content: '' }
    newNoteErrors.value = { title: '', content: '' }
  }
}

function cancelCapture(): void {
  closeCapture({ reset: true })
}

async function submitNewNote(): Promise<void> {
  await createNote()
  if (!newNoteErrors.value.title && !newNoteErrors.value.content && !form.value.title && !form.value.content) {
    closeCapture()
  }
}

async function bindEditEditor(el: unknown, note: NoteDto): Promise<void> {
  const id = noteId(note)
  if (!(el instanceof HTMLElement) || editingId.value !== id) return
  if (editEditorViews[id]) {
    // Already bound; avoid recreating on minor re-renders
    return
  }
  const parent = el
  editorLoading.value = true
  editorLoadError.value = ''
  try {
    const editor = await createCodeMirror(parent, note.content || '', (val) => {
      note.content = val
      updateEditNoteError(id, 'content', val)
    })
    if (editingId.value !== id || editEditorViews[id] || !parent.isConnected) {
      editor.destroy()
      return
    }
    editEditorViews[id] = editor
  } catch {
    editorBundlePromise = null
    editorLoadError.value = t('common.editorLoadFailed')
  } finally {
    editorLoading.value = false
  }
}

function startEditing(note: NoteDto): void {
  const id = noteId(note)
  if (editingId.value && editingId.value !== id) {
    destroyEditEditor(editingId.value)
  }
  startEditingFeature(editableNote(note))
}

function cancelEdit(note?: NoteDto | null): void {
  const id = note?._id ? noteId(note) : editingId.value
  cancelEditFeature(note ? editableNote(note) : null)
  destroyEditEditor(id)
}

function pinEditableNote(note: NoteDto): Promise<void> {
  return pinNote(editableNote(note))
}

function unpinEditableNote(note: NoteDto): Promise<void> {
  return unpinNote(editableNote(note))
}

function archiveEditableNote(note: NoteDto): Promise<void> {
  return archiveNote(editableNote(note))
}

function restoreEditableNote(note: NoteDto): Promise<void> {
  return restoreNote(editableNote(note))
}

function generateNoteTasks(note: NoteDto): Promise<void> {
  return handleAIGenerateTasks(editableNote(note))
}

onMounted(() => {
  void fetchNotes()
  preloadEditorWhenIdle()
})

onUnmounted(() => {
  destroyNewEditor()
  Object.keys(editEditorViews).forEach(destroyEditEditor)
})

async function updateNote(note: NoteDto): Promise<void> {
  await updateNoteFeature(editableNote(note))
}
</script>

<template>
  <!-- Toast Notification -->
  <Toast :message="toastMessage" :type="toastType" :visible="toast" />

  <div v-if="error" class="error">{{ error }}</div>

  <CollectionCaptureSurface
    :open="captureOpen"
    :title="t('notes.newTitle')"
    title-id="note-capture-title"
    :close-label="t('notes.closeNew')"
    @close="cancelCapture"
  >
        <div class="field-stack">
          <input
            ref="newTitleRef"
            v-model="form.title"
            :placeholder="t('notes.titlePlaceholder')"
            class="input"
            :class="{ 'is-invalid': newNoteErrors.title }"
            :disabled="loading"
            :aria-invalid="Boolean(newNoteErrors.title)"
            @input="updateNewNoteError('title', form.title)"
          />
          <p v-if="newNoteErrors.title" class="field-helper field-helper--error">{{ newNoteErrors.title }}</p>
        </div>
        <div class="field-stack">
          <div
            ref="newEditorRef"
            class="codemirror-editor"
            :class="{
              'is-invalid': newNoteErrors.content,
              'is-disabled': loading
            }"
          ></div>
          <p v-if="editorLoading && !newEditorView" class="field-helper">{{ t('common.loadingEditor') }}</p>
          <p v-if="editorLoadError" class="field-helper field-helper--error">{{ editorLoadError }}</p>
          <p v-if="newNoteErrors.content" class="field-helper field-helper--error">{{ newNoteErrors.content }}</p>
        </div>
    <template #actions>
        <ActionRow>
          <button type="button" @click="cancelCapture" :disabled="loading" class="btn btn-secondary">
            {{ t('common.cancel') }}
          </button>
          <button
            type="button"
            @click="submitNewNote"
            :disabled="loading || editorLoading || Boolean(editorLoadError) || Boolean(editingId)"
            class="btn btn-primary"
          >
            {{ loading ? t('common.saving') : t('notes.addNote') }}
          </button>
        </ActionRow>
    </template>
  </CollectionCaptureSurface>

  <CardCollection class="notes-collection" embedded>
    <template #title>
      {{ t('notes.title', { count: notes.length }) }}
    </template>
    <template #command>
      <SegmentedControl
        :model-value="showArchived ? 'archived' : 'active'"
        :options="archiveViewOptions"
        variant="page"
        :aria-label="t('notes.archiveViewLabel')"
        @update:model-value="setArchiveView"
      />
    </template>
    <template #control>
      <button
        type="button"
        class="btn btn-primary btn-sm note-create-command"
        :aria-label="t('notes.createLabel')"
        :disabled="Boolean(editingId)"
        @click="openCapture"
      >
        <span aria-hidden="true">+</span>
        <span>{{ t('common.new') }}</span>
      </button>
    </template>
    <EmptyState v-if="notes.length === 0" :title="showArchived ? t('notes.emptyArchivedTitle') : t('notes.emptyActiveTitle')" />
    <Card
      v-for="note in notes"
      :key="note._id"
      :state="note.archived ? 'archived' : null"
      @click="closeNoteMenu"
    >
      <template #header>
        <CardHeaderRow :title="note.title">
          <template #actions>
          <button
            v-if="canUseNoteAction(note, 'canPin')"
            @click.stop="note.isPinned ? unpinEditableNote(note) : pinEditableNote(note)"
            class="panel-surface-icon-btn"
            :class="{ pinned: note.isPinned }"
            :title="note.isPinned ? t('notes.unpin') : t('notes.pin')"
          >
            <svg v-if="note.isPinned" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
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
          <template #date>{{ new Date(note.updatedAt).toLocaleString() }}</template>
        </CardMetaRow>
      </template>

      <template #body>
        <div v-if="editingId === note._id && !note.archived" class="note-edit-form">
          <div class="field-stack">
            <input
              v-model="note.title"
              :placeholder="t('notes.titlePlaceholder')"
              class="input"
              :class="{ 'is-invalid': editNoteErrors[note._id]?.title }"
              :disabled="loading"
              :aria-invalid="Boolean(editNoteErrors[note._id]?.title)"
              @input="updateEditNoteError(note._id, 'title', note.title)"
            />
            <p v-if="editNoteErrors[note._id]?.title" class="field-helper field-helper--error">
              {{ editNoteErrors[note._id].title }}
            </p>
          </div>
          <div class="field-stack">
            <div
              :ref="el => { void bindEditEditor(el, note) }"
              class="codemirror-editor"
              :class="{
                'is-invalid': editNoteErrors[note._id]?.content,
                'is-disabled': loading
              }"
            ></div>
            <p v-if="editorLoading && !editEditorViews[note._id]" class="field-helper">{{ t('common.loadingEditor') }}</p>
            <p v-if="editorLoadError" class="field-helper field-helper--error">{{ editorLoadError }}</p>
            <p v-if="editNoteErrors[note._id]?.content" class="field-helper field-helper--error">
              {{ editNoteErrors[note._id].content }}
            </p>
          </div>
        </div>
        <div v-else>
          <div class="card-content markdown-body" v-html="renderMarkdown(note.content)"></div>
        </div>
      </template>

      <template #actions v-if="editingId === note._id && !note.archived">
        <ActionRow>
          <button @click="cancelEdit(note)" :disabled="loading" class="btn btn-secondary">{{ t('common.cancel') }}</button>
          <button @click="updateNote(note)" :disabled="loading" class="btn btn-primary">{{ t('common.save') }}</button>
        </ActionRow>
      </template>

      <template #actions v-else>
        <template v-if="canUseNoteAction(note, 'canRestore')">
          <ActionRow>
            <button @click="restoreEditableNote(note)" class="btn btn-secondary">{{ t('common.restore') }}</button>
            <button v-if="canUseNoteAction(note, 'canDelete')" @click="deleteNote(note._id)" class="btn btn-danger">{{ t('common.delete') }}</button>
          </ActionRow>
        </template>
        <ObjectActionArea
          v-else-if="canUseNoteAction(note, 'canGenerateAITasks')"
          variant="ai"
          active-kind="icon"
          :state="getNoteAIState(note._id)"
          @activate="generateNoteTasks(note)"
          @cancel="closeAITasks(note._id)"
        >
          <template #idle-icon>
            <svg class="icon-stroke" viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
          </template>
          <template #trailing>
            <OverflowMenu
              :open="menuOpenNoteId === note._id"
              :title="t('common.actions')"
              @toggle="toggleNoteMenu(note._id)"
            >
              <button v-if="canUseNoteAction(note, 'canEdit')" @click="startEditing(note)" class="btn btn-menu-item btn-secondary">{{ t('common.edit') }}</button>
              <button v-if="canUseNoteAction(note, 'canArchive')" @click="archiveEditableNote(note)" class="btn btn-menu-item btn-archive">{{ t('common.archive') }}</button>
              <button v-if="canUseNoteAction(note, 'canDelete')" @click="deleteNote(note._id)" class="btn btn-menu-item btn-danger">{{ t('common.delete') }}</button>
            </OverflowMenu>
          </template>
          <SectionBlock v-if="aiTasksByNote[note._id] && aiTasksByNote[note._id].length > 0" class="note-ai-tasks">
            <div class="ai-tasks-header">
              <strong>{{ t('notes.aiTasksTitle', { count: aiTasksByNote[note._id].length }) }}</strong>
            </div>
            <div v-for="(draft, idx) in aiTasksByNote[note._id]" :key="idx" class="ai-task-item">
              <div class="task-content">{{ draft }}</div>
              <div class="task-actions">
                <button @click="saveNoteTaskDraft(note._id, draft)" class="btn btn-secondary btn-sm" :disabled="savedTaskDrafts.has(draft)">
                  {{ savedTaskDrafts.has(draft) ? t('common.saved') : t('notes.saveAsTask') }}
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
.codemirror-editor {
  margin-bottom: 0;
  min-height: 156px;
}

.codemirror-editor:empty {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background:
    linear-gradient(90deg, transparent 0, transparent 48%, rgba(66, 184, 131, 0.08) 50%, transparent 52%, transparent 100%),
    var(--surface-card);
}

.notes-collection :deep(.card-collection-header) {
  position: sticky;
  top: 0;
  z-index: 40;
  padding: var(--space-md);
  background: color-mix(in srgb, var(--surface-panel) 84%, transparent);
  backdrop-filter: blur(12px);
}

.note-create-command {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

/* Legacy AI task drafts: parked until AI reveal/list cleanup. */
.ai-tasks-header {
  margin-bottom: 8px;
}

.ai-task-item {
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  background: white;
  border-radius: 4px;
  margin-bottom: 6px;
  gap: 10px;
}

.ai-task-item:last-child {
  margin-bottom: 0;
}

.task-content {
  font-size: 12px;
  color: #555;
  line-height: 1.5;
  word-break: break-word;
  overflow-wrap: break-word;
}

.task-actions {
  display: flex;
  justify-content: flex-end;
}

.note-ai-tasks {
  margin-top: 0;
  background: color-mix(in srgb, var(--identity-primary-soft) 45%, var(--surface-card));
  border: 1px solid var(--border-default);
}

.note-ai-tasks .ai-tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xs);
}

.note-ai-tasks .ai-task-item {
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-block);
}

.note-ai-tasks .task-content {
  color: var(--text-secondary);
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

/* Card edit form */
.note-edit-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

</style>
