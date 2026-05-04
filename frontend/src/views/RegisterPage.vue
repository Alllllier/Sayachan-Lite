<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const error = ref('')
const form = reactive({
  email: '',
  password: '',
  inviteCode: ''
})

async function submit() {
  error.value = ''
  try {
    await auth.registerTester(form)
    await router.push('/login')
  } catch (err) {
    error.value = err.message
  }
}
</script>

<template>
  <main class="auth-page">
    <form class="card auth-card" @submit.prevent="submit">
      <div class="auth-card__header">
        <p class="card-meta">Tester access</p>
        <h1 class="card-title">Register</h1>
      </div>

      <label class="auth-field">
        <span>Email</span>
        <input v-model="form.email" class="input" type="email" autocomplete="email" required>
      </label>

      <label class="auth-field">
        <span>Password</span>
        <input v-model="form.password" class="input" type="password" autocomplete="new-password" minlength="8" required>
      </label>

      <label class="auth-field">
        <span>Invite code</span>
        <input v-model="form.inviteCode" class="input" type="text" autocomplete="one-time-code" required>
      </label>

      <p v-if="error" class="field-helper field-helper--error">{{ error }}</p>

      <button class="btn btn-primary" type="submit" :disabled="auth.loading">Register</button>
      <RouterLink class="btn btn-secondary" to="/login">Back to login</RouterLink>
    </form>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: var(--space-lg);
  background: var(--surface-page);
}

.auth-card {
  width: min(100%, 420px);
}

.auth-card__header {
  margin-bottom: var(--space-lg);
}

.auth-field {
  display: block;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.auth-field span {
  display: block;
  margin-bottom: var(--space-xs);
}

.auth-card .btn {
  width: 100%;
  margin-top: var(--space-xs);
}
</style>
