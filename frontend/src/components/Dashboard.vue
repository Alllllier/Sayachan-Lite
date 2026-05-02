<script setup>
import { ref, onMounted } from 'vue'
import {
  deriveDashboardTaskProvenance,
  deriveDashboardTaskRowState,
  getDashboardTaskActions
} from '../features/dashboard/dashboard.rules.js'
import { useDashboardFeature } from '../features/dashboard/useDashboardFeature.js'
import EmptyState from './ui/EmptyState.vue'
import OverflowMenu from './ui/OverflowMenu.vue'
import SegmentedControl from './ui/SegmentedControl.vue'
import Toast from './ui/Toast.vue'
import { List, ListSection, ListItem, ItemContent, ItemMeta } from './ui/list'

// Toast notifications
const toast = ref(null)
const toastMessage = ref('')
const toastType = ref('success')

function showToast(message, type = 'success') {
  toastMessage.value = message
  toastType.value = type
  toast.value = true
  setTimeout(() => {
    toast.value = false
  }, 3000)
}

const archiveViewOptions = [
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' }
]

const {
  savedTasks,
  taskMenuOpen,
  isSavedTaskListExpanded,
  quickAddInput,
  isQuickAdding,
  showArchived,
  savedTaskToggleLabel,
  visibleSavedTasks,
  savedTaskListMode,
  loadSavedTasks,
  setArchiveView,
  handleQuickAddTask,
  handleTaskComplete,
  handleTaskArchive,
  handleTaskDelete,
  toggleTaskMenu,
  closeTaskMenu,
  toggleSavedTaskListExpanded
} = useDashboardFeature({
  notify: showToast
})

onMounted(loadSavedTasks)
</script>

<template>
  <Toast :message="toastMessage" :type="toastType" :visible="toast" />

  <div class="card dashboard-list-card">
    <div class="dashboard-quick-add">
      <input
        v-model="quickAddInput"
        placeholder="Quick add task... (e.g., 去拿快递)"
        @keyup.enter="handleQuickAddTask"
        :disabled="isQuickAdding"
        class="input"
      />
    </div>
    <List
      class="dashboard-card-list"
      :mode="savedTaskListMode"
      @click="closeTaskMenu"
    >
      <ListSection :aria-label="showArchived ? 'Archived saved tasks' : 'Active saved tasks'">
        <template #title>
          <div class="dashboard-list-heading">
            <span class="dashboard-list-heading-text">Saved Tasks</span>
            <SegmentedControl
              :model-value="showArchived ? 'archived' : 'active'"
              :options="archiveViewOptions"
              variant="page"
              aria-label="Dashboard task archive view"
              @update:model-value="setArchiveView"
            />
          </div>
        </template>

        <template v-if="savedTasks.length > 0" #control>
          <button
            type="button"
            class="btn btn-ghost btn-sm"
            :aria-expanded="isSavedTaskListExpanded"
            @click.stop="toggleSavedTaskListExpanded"
          >
            {{ savedTaskToggleLabel }}
          </button>
        </template>

        <ListItem
          v-for="task in visibleSavedTasks"
          :key="task._id"
          element="div"
          :interactive="deriveDashboardTaskRowState(task, showArchived).interactive"
          :muted="task.completed || task.status === 'completed'"
          :archived="showArchived"
          :raised="taskMenuOpen === task._id"
          :role="deriveDashboardTaskRowState(task, showArchived).role"
          :tabindex="deriveDashboardTaskRowState(task, showArchived).tabindex"
          :aria-pressed="deriveDashboardTaskRowState(task, showArchived).ariaPressed"
          @click="deriveDashboardTaskRowState(task, showArchived).interactive ? handleTaskComplete(task) : null"
          @keydown.enter.prevent="deriveDashboardTaskRowState(task, showArchived).interactive ? handleTaskComplete(task) : null"
          @keydown.space.prevent="deriveDashboardTaskRowState(task, showArchived).interactive ? handleTaskComplete(task) : null"
        >
          <ItemContent :text="task.title" />
          <ItemMeta>
            <span
              class="source-dot"
              :class="deriveDashboardTaskProvenance(task).className"
              :title="deriveDashboardTaskProvenance(task).tooltip"
            >{{ deriveDashboardTaskProvenance(task).letter }}</span>
            <OverflowMenu
              :open="taskMenuOpen === task._id"
              title="Actions"
              @toggle="toggleTaskMenu(task._id)"
            >
              <button @click="handleTaskArchive(task)" class="btn btn-menu-item btn-archive">{{ getDashboardTaskActions(showArchived)[0] }}</button>
              <button @click="handleTaskDelete(task)" class="btn btn-menu-item btn-danger">{{ getDashboardTaskActions(showArchived)[1] }}</button>
            </OverflowMenu>
          </ItemMeta>
        </ListItem>
        <li v-if="savedTasks.length === 0" class="dashboard-list-empty">
          <EmptyState :title="showArchived ? 'No archived tasks' : 'No saved tasks yet'" :description="showArchived ? 'Archive tasks to see them here' : 'Add tasks from quick add above'" />
        </li>
      </ListSection>
    </List>
  </div>

</template>

<style scoped>
.dashboard-list-card {
  padding: 0;
  overflow: hidden;
}

.dashboard-quick-add {
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--border-subtle);
}

.dashboard-quick-add .input {
  margin-bottom: 0;
}

.dashboard-card-list {
  --dashboard-task-provenance-size: 16px;
  background: transparent;
  border-radius: 0;
}

.dashboard-list-heading {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.dashboard-list-heading-text {
  font-size: var(--font-size-section);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.dashboard-list-empty {
  list-style: none;
}

@media (max-width: 480px) {
  .dashboard-card-list :deep(.list-item) {
    align-items: center;
    flex-direction: row;
  }

  .dashboard-card-list :deep(.item-meta) {
    width: auto;
    justify-content: flex-end;
  }
}

.source-dot {
  width: var(--dashboard-task-provenance-size);
  height: var(--dashboard-task-provenance-size);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
  background-color: var(--text-muted);
}

.source-dot.provenance-ai {
  background: var(--button-ai-surface);
  border: 1px solid var(--accent-spark);
  color: var(--button-ai-text);
}

</style>
