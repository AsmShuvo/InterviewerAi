<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const entries = ref([])
const userBest = ref(null)
const loading = ref(true)
const filterRole = ref('')

async function fetchLeaderboard() {
  loading.value = true
  try {
    const params = filterRole.value ? { job_role: filterRole.value } : {}
    const { data } = await axios.get('/api/leaderboard', { params })
    entries.value = data.leaderboard
    userBest.value = data.user_best
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchLeaderboard)

function medalColor(i) {
  if (i === 0) return 'text-yellow-400'
  if (i === 1) return 'text-gray-300'
  if (i === 2) return 'text-amber-600'
  return 'text-gray-500'
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Leaderboard</h1>

    <div class="flex items-center gap-3 mb-6">
      <select v-model="filterRole" @change="fetchLeaderboard"
        class="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white">
        <option value="">All Roles</option>
        <option>Frontend Developer</option>
        <option>Backend Developer</option>
        <option>Full Stack Developer</option>
        <option>DevOps Engineer</option>
        <option>UI/UX Designer</option>
      </select>
      <span v-if="userBest" class="text-sm text-gray-400 ml-auto">Your best: <span class="text-indigo-400 font-bold">{{ parseFloat(userBest).toFixed(1) }}</span>/10</span>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-400"></div>
    </div>

    <div v-else-if="entries.length === 0" class="text-center py-16 text-gray-500">
      No scores yet. Be the first!
    </div>

    <div v-else class="space-y-2">
      <div v-for="(entry, i) in entries" :key="entry.id"
        :class="entry.user_id === auth.user?.id ? 'border-indigo-500/50 bg-indigo-900/10' : 'border-gray-800'"
        class="flex items-center gap-4 p-4 bg-gray-900 border rounded-xl">
        <span :class="medalColor(i)" class="text-xl font-bold w-8 text-center">{{ i + 1 }}</span>
        <div class="flex-1">
          <p class="font-medium" :class="entry.user_id === auth.user?.id ? 'text-indigo-300' : ''">
            {{ entry.user_name }}
            <span v-if="entry.user_id === auth.user?.id" class="text-xs text-indigo-400 ml-1">(You)</span>
          </p>
          <p class="text-sm text-gray-400">{{ entry.job_role }}</p>
        </div>
        <span class="text-xl font-bold text-indigo-400">{{ parseFloat(entry.score).toFixed(1) }}</span>
      </div>
    </div>
  </div>
</template>
