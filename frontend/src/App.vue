<script setup>
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

const auth = useAuthStore()
const router = useRouter()

async function logout() {
  await auth.logout()
  toast.success('Logged out')
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <!-- Navbar -->
    <nav v-if="auth.user" class="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-2">
            <span class="text-xl font-bold text-indigo-400">InterviewAI</span>
          </div>
          <div class="hidden md:flex items-center gap-1">
            <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
            <router-link to="/interview/setup" class="nav-link">New Interview</router-link>
            <router-link to="/history" class="nav-link">History</router-link>
            <router-link to="/leaderboard" class="nav-link">Leaderboard</router-link>
            <router-link to="/profile" class="nav-link">Profile</router-link>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-400 hidden sm:block">{{ auth.user.name }}</span>
            <button @click="logout" class="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition">Logout</button>
          </div>
        </div>
        <!-- Mobile nav -->
        <div class="flex md:hidden gap-1 pb-2 overflow-x-auto">
          <router-link to="/dashboard" class="nav-link text-xs whitespace-nowrap">Dashboard</router-link>
          <router-link to="/interview/setup" class="nav-link text-xs whitespace-nowrap">New Interview</router-link>
          <router-link to="/history" class="nav-link text-xs whitespace-nowrap">History</router-link>
          <router-link to="/leaderboard" class="nav-link text-xs whitespace-nowrap">Leaderboard</router-link>
          <router-link to="/profile" class="nav-link text-xs whitespace-nowrap">Profile</router-link>
        </div>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<style>
@reference "tailwindcss";
.nav-link {
  @apply px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition;
}
.router-link-active {
  @apply text-indigo-400 bg-gray-800/50;
}
</style>
