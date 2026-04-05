<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../axios'
import { toast } from 'vue3-toastify'

const route = useRoute()
const router = useRouter()
const interview = ref(null)
const questions = ref([])
const loading = ref(true)

const gradeColors = { A: 'from-green-500 to-emerald-600', B: 'from-blue-500 to-indigo-600', C: 'from-yellow-500 to-orange-600', D: 'from-red-500 to-rose-600' }
const gradeLabels = { A: 'Excellent', B: 'Good', C: 'Average', D: 'Needs Improvement' }

onMounted(async () => {
  try {
    const { data } = await api.get(`/api/interview/${route.params.id}`)
    interview.value = data.interview
    questions.value = data.questions
  } catch (err) {
    toast.error('Failed to load results')
    router.push('/dashboard')
  } finally {
    loading.value = false
  }
})

function scoreColor(score) {
  if (score >= 8) return 'text-green-400'
  if (score >= 6) return 'text-yellow-400'
  return 'text-red-400'
}

function shareScore() {
  const text = `I scored ${parseFloat(interview.value.total_score).toFixed(1)}/10 (Grade ${interview.value.grade}) on my ${interview.value.job_role} mock interview on InterviewAI!`
  navigator.clipboard.writeText(text)
  toast.success('Score copied to clipboard!')
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-400"></div>
    </div>

    <template v-else-if="interview">
      <!-- Score Header -->
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8 text-center">
        <p class="text-sm text-gray-400 mb-1">{{ interview.job_role }} · {{ interview.difficulty }} · {{ interview.interview_type }}</p>
        <p v-if="interview.selected_stacks" class="text-xs text-gray-500 mb-2 max-w-lg mx-auto">{{ interview.selected_stacks }}</p>
        <div class="inline-flex items-center justify-center w-28 h-28 rounded-full mb-4"
          :class="'bg-gradient-to-br ' + (gradeColors[interview.grade] || gradeColors.D)">
          <span class="text-4xl font-bold text-white">{{ interview.grade }}</span>
        </div>
        <p class="text-3xl font-bold">{{ parseFloat(interview.total_score).toFixed(1) }}<span class="text-lg text-gray-400">/10</span></p>
        <p class="text-gray-400 mt-1">{{ gradeLabels[interview.grade] }}</p>
        <div class="flex gap-3 justify-center mt-6">
          <button @click="router.push('/interview/setup')" class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg transition">Retake</button>
          <button @click="shareScore" class="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 px-6 rounded-lg transition">Share Score</button>
        </div>
      </div>

      <!-- Questions Breakdown -->
      <h2 class="text-xl font-bold mb-4">Question Breakdown</h2>
      <div class="space-y-4">
        <div v-for="(q, i) in questions" :key="q.id" class="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div class="flex items-start justify-between mb-3">
            <h3 class="font-medium text-indigo-300">Q{{ i + 1 }}. {{ q.question_text }}</h3>
            <span :class="scoreColor(q.score)" class="text-xl font-bold ml-4 shrink-0">{{ q.score }}/10</span>
          </div>

          <div class="space-y-3 text-sm">
            <div class="bg-gray-800/50 rounded-lg p-4">
              <p class="text-gray-400 font-medium mb-1">Your Answer</p>
              <p class="text-gray-200">{{ q.answer_text }}</p>
            </div>
            <div class="grid sm:grid-cols-2 gap-3">
              <div class="bg-green-900/20 border border-green-800/30 rounded-lg p-4">
                <p class="text-green-400 font-medium mb-1">Strength</p>
                <p class="text-gray-300">{{ q.strength }}</p>
              </div>
              <div class="bg-red-900/20 border border-red-800/30 rounded-lg p-4">
                <p class="text-red-400 font-medium mb-1">Weakness</p>
                <p class="text-gray-300">{{ q.weakness }}</p>
              </div>
            </div>
            <div class="bg-indigo-900/20 border border-indigo-800/30 rounded-lg p-4">
              <p class="text-indigo-400 font-medium mb-1">Better Answer</p>
              <p class="text-gray-300">{{ q.better_answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
