import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/register', name: 'Register', component: () => import('../views/Register.vue'), meta: { guest: true } },
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue'), meta: { guest: true } },
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'Dashboard', component: () => import('../views/Dashboard.vue'), meta: { auth: true } },
  { path: '/interview/setup', name: 'InterviewSetup', component: () => import('../views/InterviewSetup.vue'), meta: { auth: true } },
  { path: '/interview/room/:id', name: 'InterviewRoom', component: () => import('../views/InterviewRoom.vue'), meta: { auth: true } },
  { path: '/interview/result/:id', name: 'InterviewResult', component: () => import('../views/InterviewResult.vue'), meta: { auth: true } },
  { path: '/history', name: 'History', component: () => import('../views/History.vue'), meta: { auth: true } },
  { path: '/leaderboard', name: 'Leaderboard', component: () => import('../views/Leaderboard.vue'), meta: { auth: true } },
  { path: '/profile', name: 'Profile', component: () => import('../views/Profile.vue'), meta: { auth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()
  if (!auth.user && !auth.checked) {
    await auth.fetchUser()
  }
  if (to.meta.auth && !auth.user) {
    next('/login')
  } else if (to.meta.guest && auth.user) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
