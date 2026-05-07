import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import type { AuthStore } from '../stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/notes'
  },
  {
    path: '/login',
    component: () => import('../views/LoginPage.vue'),
    meta: { public: true }
  },
  {
    path: '/register',
    component: () => import('../views/RegisterPage.vue'),
    meta: { public: true }
  },
  {
    path: '/notes',
    component: () => import('../views/NotesPage.vue')
  },
  {
    path: '/dashboard',
    component: () => import('../views/DashboardPage.vue')
  },
  {
    path: '/projects',
    component: () => import('../views/ProjectsPage.vue')
  },
  {
    path: '/owner',
    component: () => import('../views/OwnerPage.vue'),
    meta: { ownerOnly: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  const auth = useAuthStore() as AuthStore
  if (!auth.initialized) {
    await auth.loadCurrentUser()
  }

  if (to.meta.public) {
    return auth.isAuthenticated ? '/notes' : true
  }

  if (!auth.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.meta.ownerOnly && !auth.isOwner) {
    return '/notes'
  }

  return true
})

export default router
