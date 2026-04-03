import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/notes'
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
