<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { toast } from 'vue3-toastify'

const route = useRoute()
const router = useRouter()
const interview = ref(null)
const currentQuestion = ref(null)
const answer = ref('')
const loading = ref(true)
const submitting = ref(false)
const questionNumber = ref(1)

// Timer: counts UP from 0, with pause/resume
const timer = ref(0)
const timerRunning = ref(false)
let timerInterval = null

const progressPercent = computed(() => {
  if (!interview.value) return 0
  return ((questionNumber.value - 1) / interview.value.question_count) * 100
})

const timerDisplay = computed(() => {
  const hrs = Math.floor(timer.value / 3600)
  const min = Math.floor((timer.value % 3600) / 60)
  const sec = timer.value % 60
  if (hrs > 0) {
    return `${hrs}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }
  return `${min}:${sec.toString().padStart(2, '0')}`
})

function startTimer() {
  if (timerInterval) clearInterval(timerInterval)
  timerRunning.value = true
  timerInterval = setInterval(() => {
    timer.value++
  }, 1000)
}

function pauseTimer() {
  timerRunning.value = false
  clearInterval(timerInterval)
  timerInterval = null
}

function toggleTimer() {
  if (timerRunning.value) {
    pauseTimer()
  } else {
    startTimer()
  }
}

onMounted(async () => {
  try {
    const { data } = await axios.get(`/api/interview/${route.params.id}`)
    interview.value = data.interview
    if (data.interview.status === 'completed') {
      router.replace(`/interview/result/${route.params.id}`)
      return
    }
    // Find the latest unanswered question
    const unanswered = data.questions.filter(q => !q.answer_text)
    if (unanswered.length > 0) {
      currentQuestion.value = unanswered[0]
      questionNumber.value = unanswered[0].order_number
    } else {
      const lastQ = data.questions[data.questions.length - 1]
      questionNumber.value = lastQ.order_number + 1
    }
    // Auto-start timer
    startTimer()
  } catch (err) {
    toast.error('Failed to load interview')
    router.push('/dashboard')
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  clearInterval(timerInterval)
})

async function submitAnswer() {
  if (submitting.value || !currentQuestion.value) return
  submitting.value = true
  pauseTimer()

  const answerText = answer.value.trim() || '(No answer provided)'
  const timeTaken = timer.value

  try {
    const { data } = await axios.post('/api/interview/answer', {
      interview_id: interview.value.id,
      question_id: currentQuestion.value.id,
      answer_text: answerText,
      time_taken: timeTaken
    })

    if (data.completed) {
      toast.success(`Interview complete! Grade: ${data.grade}`)
      router.push(`/interview/result/${interview.value.id}`)
    } else {
      currentQuestion.value = data.next_question
      questionNumber.value = data.next_question.order_number
      answer.value = ''
      // Reset timer for next question
      timer.value = 0
      startTimer()
    }
  } catch (err) {
    toast.error('Failed to submit answer')
    startTimer()
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-400"></div>
    </div>

    <template v-else-if="interview && currentQuestion">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold">{{ interview.job_role }}</h1>
          <p class="text-sm text-gray-400">{{ interview.difficulty }} · {{ interview.interview_type }}
            <span v-if="interview.selected_stacks" class="hidden sm:inline"> · {{ interview.selected_stacks }}</span>
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="toggleTimer"
            class="p-2 rounded-lg transition text-sm"
            :class="timerRunning ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400'">
            <span v-if="timerRunning" class="flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><rect x="5" y="4" width="3" height="12" rx="1"/><rect x="12" y="4" width="3" height="12" rx="1"/></svg>
              Pause
            </span>
            <span v-else class="flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6.5 4.5l10 5.5-10 5.5V4.5z"/></svg>
              Resume
            </span>
          </button>
          <div class="text-2xl font-mono font-bold text-gray-300 tabular-nums min-w-[5ch] text-right">
            {{ timerDisplay }}
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="mb-8">
        <div class="flex justify-between text-sm text-gray-400 mb-2">
          <span>Question {{ questionNumber }} of {{ interview.question_count }}</span>
          <span>{{ Math.round(progressPercent) }}%</span>
        </div>
        <div class="w-full bg-gray-800 rounded-full h-2">
          <div class="bg-indigo-500 h-2 rounded-full transition-all duration-500" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>

      <!-- Question -->
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-6">
        <p class="text-lg leading-relaxed">{{ currentQuestion.question_text }}</p>
      </div>

      <!-- Answer -->
      <div class="space-y-4">
        <textarea v-model="answer" rows="8" placeholder="Type your answer here..."
          class="w-full bg-gray-900 border border-gray-800 rounded-xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-base"
          :disabled="submitting"
          @keydown.ctrl.enter="submitAnswer"></textarea>
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-500">Ctrl+Enter to submit</p>
          <button @click="submitAnswer" :disabled="submitting"
            class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg transition disabled:opacity-50">
            {{ submitting ? 'Evaluating...' : questionNumber < interview.question_count ? 'Submit & Next' : 'Submit & Finish' }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
