<script setup>
import { ref, reactive, onMounted, defineEmits, nextTick } from 'vue'
import { basicSetup } from 'codemirror'
import { EditorView } from '@codemirror/view'
import { markdown } from '@codemirror/lang-markdown'
import 'highlight.js/styles/github.css'
import { renderMarkdown } from '../utils/markdown.js'
import { useNotesFeature } from '../features/notes/useNotesFeature.js'
import {
  Card,
  CardHeaderRow,
  CardMetaRow,
  SectionBlock,
  ActionRow,
  ObjectActionArea
} from './ui/surfaces'
import { CardCollection } from './ui/shell'
import Toast from './ui/Toast.vue'
import EmptyState from './ui/EmptyState.vue'
import OverflowMenu from './ui/OverflowMenu.vue'
import SegmentedControl from './ui/SegmentedControl.vue'

const menuOpenNoteId = ref(null)

// Markdown editor refs
const newEditorRef = ref(null)
const newEditorView = ref(null)
const editEditorViews = reactive({})

// Toast notifications
const toast = ref(null)
const toastMessage = ref('')
const toastType = ref('success') // success, error

const archiveViewOptions = [
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' }
]

function clearNewEditor() {
  if (!newEditorView.value) return
  const doc = newEditorView.value.state.doc
  newEditorView.value.dispatch({
    changes: { from: 0, to: doc.length, insert: '' }
  })
}

function destroyEditEditor(noteId) {
  if (editEditorViews[noteId]) {
    editEditorViews[noteId].destroy()
    delete editEditorViews[noteId]
  }
}

function showToast(message, type = 'success') {
  toastMessage.value = message
  toastType.value = type
  toast.value = true
  setTimeout(() => {
    toast.value = false
  }, 3000)
}

function toggleNoteMenu(noteId) {
  if (menuOpenNoteId.value === noteId) {
    menuOpenNoteId.value = null
  } else {
    menuOpenNoteId.value = noteId
  }
}

function closeNoteMenu() {
  menuOpenNoteId.value = null
}

const emit = defineEmits(['refreshed'])

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
  saveNoteTaskDraft
} = useNotesFeature({
  notify: showToast,
  onRefreshed: refreshedNotes => emit('refreshed', refreshedNotes),
  onNoteCreated: clearNewEditor,
  onNoteUpdated: destroyEditEditor
})

// CodeMirror factory
function createCodeMirror(parent, initialValue, onChange) {
  return new EditorView({
    doc: initialValue || '',
    extensions: [
      basicSetup,
      markdown(),
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
      EditorView.updateListener.of((update) => {
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

function bindEditEditor(el, note) {
  if (!el || editingId.value !== note._id) return
  if (editEditorViews[note._id]) {
    // Already bound; avoid recreating on minor re-renders
    return
  }
  editEditorViews[note._id] = createCodeMirror(el, note.content || '', (val) => {
    note.content = val
    updateEditNoteError(note._id, 'content', val)
  })
}

function startEditing(note) {
  if (editingId.value && editingId.value !== note._id) {
    destroyEditEditor(editingId.value)
  }
  startEditingFeature(note)
}

function cancelEdit(note) {
  const noteId = note?._id || editingId.value
  cancelEditFeature(note)
  destroyEditEditor(noteId)
}

onMounted(() => {
  fetchNotes()
  nextTick(() => {
    if (newEditorRef.value) {
      newEditorView.value = createCodeMirror(newEditorRef.value, '', (val) => {
        form.value.content = val
      })
    }
  })
})

async function updateNote(note) {
  await updateNoteFeature(note)
}
</script>

<template>
  <!-- Toast Notification -->
  <Toast :message="toastMessage" :type="toastType" :visible="toast" />

  <div v-if="error" class="error">{{ error }}</div>

  <div class="form-section">
    <h2>{{ editingId ? 'Edit Note' : 'New Note' }}</h2>
    <div class="field-stack">
      <input
        v-model="form.title"
        placeholder="Title"
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
      <p v-if="newNoteErrors.content" class="field-helper field-helper--error">{{ newNoteErrors.content }}</p>
    </div>
    <ActionRow>
      <button @click="createNote" :disabled="loading || editingId" class="btn btn-primary">
        {{ loading ? 'Saving...' : 'Add Note' }}
      </button>
      <button v-if="editingId" @click="cancelEdit" :disabled="loading" class="btn btn-secondary">
        Cancel
      </button>
    </ActionRow>
  </div>

  <CardCollection>
    <template #title>
      Notes ({{ notes.length }})
    </template>
    <template #control>
      <SegmentedControl
        :model-value="showArchived ? 'archived' : 'active'"
        :options="archiveViewOptions"
        variant="page"
        aria-label="Notes archive view"
        @update:model-value="setArchiveView"
      />
    </template>
    <EmptyState v-if="notes.length === 0" :title="showArchived ? 'No archived notes' : 'No notes yet'" />
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
            @click.stop="note.isPinned ? unpinNote(note) : pinNote(note)"
            class="panel-surface-icon-btn"
            :class="{ pinned: note.isPinned }"
            :title="note.isPinned ? 'Unpin note' : 'Pin note'"
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
              placeholder="Title"
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
              :ref="el => bindEditEditor(el, note)"
              class="codemirror-editor"
              :class="{
                'is-invalid': editNoteErrors[note._id]?.content,
                'is-disabled': loading
              }"
            ></div>
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
          <button @click="cancelEdit(note)" :disabled="loading" class="btn btn-secondary">Cancel</button>
          <button @click="updateNote(note)" :disabled="loading" class="btn btn-primary">Save</button>
        </ActionRow>
      </template>

      <template #actions v-else>
        <template v-if="canUseNoteAction(note, 'canRestore')">
          <ActionRow>
            <button @click="restoreNote(note)" class="btn btn-secondary">Restore</button>
            <button v-if="canUseNoteAction(note, 'canDelete')" @click="deleteNote(note._id)" class="btn btn-danger">Delete</button>
          </ActionRow>
        </template>
        <ObjectActionArea
          v-else-if="canUseNoteAction(note, 'canGenerateAITasks')"
          variant="ai"
          active-kind="icon"
          :state="getNoteAIState(note._id)"
          @activate="handleAIGenerateTasks(note)"
          @cancel="closeAITasks(note._id)"
        >
          <template #idle-icon>
            <svg class="icon-stroke" viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
          </template>
          <template #trailing>
            <OverflowMenu
              :open="menuOpenNoteId === note._id"
              title="Actions"
              @toggle="toggleNoteMenu(note._id)"
            >
              <button v-if="canUseNoteAction(note, 'canEdit')" @click="startEditing(note)" class="btn btn-menu-item btn-secondary">Edit</button>
              <button v-if="canUseNoteAction(note, 'canArchive')" @click="archiveNote(note)" class="btn btn-menu-item btn-archive">Archive</button>
              <button v-if="canUseNoteAction(note, 'canDelete')" @click="deleteNote(note._id)" class="btn btn-menu-item btn-danger">Delete</button>
            </OverflowMenu>
          </template>
          <SectionBlock v-if="aiTasksByNote[note._id] && aiTasksByNote[note._id].length > 0" class="note-ai-tasks">
            <div class="ai-tasks-header">
              <strong>AI Tasks ({{ aiTasksByNote[note._id].length }})</strong>
            </div>
            <div v-for="(draft, idx) in aiTasksByNote[note._id]" :key="idx" class="ai-task-item">
              <div class="task-content">{{ draft }}</div>
              <div class="task-actions">
                <button @click="saveNoteTaskDraft(note._id, draft)" class="btn btn-secondary btn-sm" :disabled="savedTaskDrafts.has(draft)">
                  {{ savedTaskDrafts.has(draft) ? 'Saved' : 'Save as Task' }}
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
/* Legacy creation form: future hover-icon creation flow will replace this area. */
.form-section {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  padding: var(--space-lg);
  background: var(--surface-panel);
}

.codemirror-editor {
  margin-bottom: 0;
}

.form-section h2 {
  font-size: var(--font-size-title);
  margin-top: 0;
  margin-bottom: var(--space-md);
  color: var(--text-primary);
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
  padding: 12px;
  background: #fee;
  color: #c33;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
}

/* Card edit form */
.note-edit-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
</style>
