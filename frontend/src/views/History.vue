<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const interviews = ref([])
const loading = ref(true)
const filterRole = ref('')
const filterDifficulty = ref('')

const filtered = computed(() => {
  return interviews.value.filter(iv => {
    if (filterRole.value && iv.job_role !== filterRole.value) return false
    if (filterDifficulty.value && iv.difficulty !== filterDifficulty.value) return false
    return true
  })
})

onMounted(async () => {
  try {
    const { data } = await api.get('/api/interview/history')
    interviews.value = data.interviews
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

function gradeColor(grade) {
  const colors = { A: 'text-green-400', B: 'text-blue-400', C: 'text-yellow-400', D: 'text-red-400' }
  return colors[grade] || 'text-gray-400'
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Interview History</h1>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-6">
      <select v-model="filterRole" class="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white">
        <option value="">All Roles</option>
        <option>Frontend Developer</option>
        <option>Backend Developer</option>
        <option>Full Stack Developer</option>
        <option>DevOps Engineer</option>
        <option>UI/UX Designer</option>
      </select>
      <select v-model="filterDifficulty" class="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white">
        <option value="">All Levels</option>
        <option>Junior</option>
        <option>Mid</option>
        <option>Senior</option>
      </select>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-400"></div>
    </div>

    <div v-else-if="filtered.length === 0" class="text-center py-16 text-gray-500">
      No interviews found.
    </div>

    <div v-else class="space-y-3">
      <div v-for="iv in filtered" :key="iv.id"
        @click="router.push(iv.status === 'completed' ? `/interview/result/${iv.id}` : `/interview/room/${iv.id}`)"
        class="flex items-center justify-between p-5 bg-gray-900 border border-gray-800 rounded-xl cursor-pointer hover:border-gray-700 transition">
        <div>
          <p class="font-medium">{{ iv.job_role }}</p>
          <p class="text-sm text-gray-400">{{ iv.difficulty }} · {{ iv.interview_type }} · {{ iv.question_count }} Qs · {{ formatDate(iv.created_at) }}</p>
              <p v-if="iv.selected_stacks" class="text-xs text-gray-500 mt-0.5 line-clamp-1">{{ iv.selected_stacks }}</p>
        </div>
        <div class="text-right">
          <span v-if="iv.status === 'completed'" :class="gradeColor(iv.grade)" class="text-2xl font-bold">{{ iv.grade }}</span>
          <span v-else class="text-yellow-400 text-sm font-medium">In Progress</span>
          <p v-if="iv.total_score" class="text-sm text-gray-400">{{ parseFloat(iv.total_score).toFixed(1) }}/10</p>
        </div>
      </div>
    </div>
  </div>
</template>
