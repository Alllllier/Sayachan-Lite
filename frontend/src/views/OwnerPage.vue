<script setup>
import { onMounted, ref } from 'vue'
import Toast from '../components/ui/Toast.vue'
import {
  createInvite,
  disableTester,
  fetchInvites,
  fetchSystemStatus,
  fetchTesters,
  restoreTester,
  revokeInvite
} from '../features/auth/auth.api'

const loading = ref(false)
const error = ref('')
const invites = ref([])
const testers = ref([])
const status = ref(null)
const newestInviteCode = ref('')
const toast = ref({ visible: false, message: '', type: 'success' })

function showToast(message, type = 'success') {
  toast.value = { visible: true, message, type }
  window.setTimeout(() => {
    toast.value.visible = false
  }, 2200)
}

async function loadOwnerData() {
  loading.value = true
  error.value = ''
  try {
    const [inviteData, testerData, systemData] = await Promise.all([
      fetchInvites(),
      fetchTesters(),
      fetchSystemStatus()
    ])
    invites.value = inviteData
    testers.value = testerData
    status.value = systemData
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function handleCreateInvite() {
  try {
    const invite = await createInvite()
    newestInviteCode.value = invite.code
    await loadOwnerData()
    showToast('Invite created')
  } catch (err) {
    showToast(err.message, 'error')
  }
}

async function handleRevoke(inviteId) {
  try {
    await revokeInvite(inviteId)
    await loadOwnerData()
    showToast('Invite revoked')
  } catch (err) {
    showToast(err.message, 'error')
  }
}

async function handleTesterStatus(tester) {
  try {
    if (tester.disabled) {
      await restoreTester(tester._id)
      showToast('Tester restored')
    } else {
      await disableTester(tester._id)
      showToast('Tester disabled')
    }
    await loadOwnerData()
  } catch (err) {
    showToast(err.message, 'error')
  }
}

function inviteState(invite) {
  if (invite.revokedAt) return 'revoked'
  if (invite.usedAt) return 'used'
  if (new Date(invite.expiresAt) <= new Date()) return 'expired'
  return 'active'
}

onMounted(loadOwnerData)
</script>

<template>
  <main class="owner-page">
    <section class="owner-header">
      <div>
        <p class="card-meta">Owner</p>
        <h1>Management</h1>
      </div>
      <button class="btn btn-primary" type="button" @click="handleCreateInvite">New invite</button>
    </section>

    <p v-if="loading" class="card-meta">Loading owner data</p>
    <p v-if="error" class="field-helper field-helper--error">{{ error }}</p>

    <section v-if="newestInviteCode" class="card owner-highlight">
      <p class="card-meta">New invite code</p>
      <strong>{{ newestInviteCode }}</strong>
    </section>

    <section class="owner-grid">
      <article class="card">
        <h2 class="card-title">System status</h2>
        <dl v-if="status" class="owner-stats">
          <div><dt>Users</dt><dd>{{ status.userCount }}</dd></div>
          <div><dt>Testers</dt><dd>{{ status.testerCount }}</dd></div>
          <div><dt>Active invites</dt><dd>{{ status.activeInviteCount }}</dd></div>
          <div><dt>Sessions</dt><dd>{{ status.activeSessionCount }}</dd></div>
        </dl>
      </article>

      <article class="card">
        <h2 class="card-title">Invites</h2>
        <ul class="owner-list">
          <li v-for="invite in invites" :key="invite._id">
            <div>
              <strong>{{ invite.codePreview }}</strong>
              <p class="card-meta">{{ inviteState(invite) }}</p>
            </div>
            <button
              v-if="inviteState(invite) === 'active'"
              class="btn btn-danger btn-sm"
              type="button"
              @click="handleRevoke(invite._id)"
            >
              Revoke
            </button>
          </li>
        </ul>
      </article>

      <article class="card">
        <h2 class="card-title">Tester accounts</h2>
        <ul class="owner-list">
          <li v-for="tester in testers" :key="tester._id">
            <div>
              <strong>{{ tester.email }}</strong>
              <p class="card-meta">{{ tester.disabled ? 'disabled' : 'active' }}</p>
            </div>
            <button class="btn btn-secondary btn-sm" type="button" @click="handleTesterStatus(tester)">
              {{ tester.disabled ? 'Restore' : 'Disable' }}
            </button>
          </li>
        </ul>
      </article>
    </section>

    <Toast :message="toast.message" :type="toast.type" :visible="toast.visible" />
  </main>
</template>

<style scoped>
.owner-page {
  width: min(100%, 1080px);
  margin: 0 auto;
  padding: var(--space-lg);
}

.owner-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.owner-header h1 {
  font-size: var(--font-size-2xl);
  margin: 0;
}

.owner-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--space-md);
}

.owner-highlight strong {
  display: block;
  margin-top: var(--space-xs);
  color: var(--text-emphasis);
  word-break: break-all;
}

.owner-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  list-style: none;
}

.owner-list li,
.owner-stats div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  padding: var(--space-sm) 0;
  border-top: 1px solid var(--border-default);
}

.owner-list strong {
  word-break: break-word;
}

.owner-stats {
  display: flex;
  flex-direction: column;
}

.owner-stats dt {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.owner-stats dd {
  margin: 0;
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}

@media (max-width: 560px) {
  .owner-header {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
