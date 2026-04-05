<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { useRouter } from 'vue-router'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const router = useRouter()
const stats = ref(null)
const loading = ref(true)

const chartData = ref({ labels: [], datasets: [] })
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { min: 0, max: 10, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } },
    x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
  },
  plugins: { legend: { display: false } }
}

onMounted(async () => {
  try {
    const { data } = await axios.get('/api/dashboard/stats')
    stats.value = data
    if (data.progress.length > 0) {
      chartData.value = {
        labels: data.progress.map((p, i) => `#${i + 1}`),
        datasets: [{
          label: 'Score',
          data: data.progress.map(p => parseFloat(p.total_score)),
          borderColor: '#818cf8',
          backgroundColor: 'rgba(129, 140, 248, 0.1)',
          fill: true,
          tension: 0.4
        }]
      }
    }
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
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-bold">Dashboard</h1>
      <router-link to="/interview/setup" class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg transition">
        Start New Interview
      </router-link>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-400"></div>
    </div>

    <template v-else-if="stats">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p class="text-sm text-gray-400">Total Interviews</p>
          <p class="text-3xl font-bold mt-1">{{ stats.total_interviews }}</p>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p class="text-sm text-gray-400">Average Score</p>
          <p class="text-3xl font-bold mt-1">{{ stats.avg_score.toFixed(1) }}<span class="text-lg text-gray-500">/10</span></p>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p class="text-sm text-gray-400">Best Score</p>
          <p class="text-3xl font-bold mt-1 text-indigo-400">{{ stats.best_score.toFixed(1) }}<span class="text-lg text-gray-500">/10</span></p>
        </div>
      </div>

      <!-- Chart -->
      <div v-if="stats.progress.length > 0" class="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
        <h2 class="text-lg font-semibold mb-4">Score Progress</h2>
        <div class="h-64">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Recent Interviews -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 class="text-lg font-semibold mb-4">Recent Interviews</h2>
        <div v-if="stats.recent_interviews.length === 0" class="text-gray-500 text-center py-8">
          No interviews yet. Start your first one!
        </div>
        <div v-else class="space-y-3">
          <div v-for="iv in stats.recent_interviews" :key="iv.id"
            @click="iv.status === 'completed' ? router.push(`/interview/result/${iv.id}`) : null"
            class="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800 transition">
            <div>
              <p class="font-medium">{{ iv.job_role }}</p>
              <p class="text-sm text-gray-400">{{ iv.difficulty }} · {{ iv.interview_type }} · {{ iv.question_count }} Qs</p>
            </div>
            <div class="text-right">
              <span v-if="iv.status === 'completed'" :class="gradeColor(iv.grade)" class="text-xl font-bold">{{ iv.grade }}</span>
              <span v-else class="text-yellow-400 text-sm">In Progress</span>
              <p v-if="iv.total_score" class="text-sm text-gray-400">{{ parseFloat(iv.total_score).toFixed(1) }}/10</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
