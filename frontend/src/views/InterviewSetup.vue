<script setup>
import { ref, computed } from 'vue'
import api from '../axios'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

const router = useRouter()
const loading = ref(false)

const form = ref({
  job_role: 'Frontend Developer',
  difficulty: 'Junior',
  interview_type: 'Technical',
  question_type: 'both',
  question_count: 5
})

const selectedStacks = ref([])

const roles = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'UI/UX Designer']
const difficulties = ['Junior', 'Mid', 'Senior']
const types = ['Technical', 'HR', 'Mixed']
const questionTypes = [
  { value: 'theoretical', label: 'Theoretical', desc: 'Concepts, definitions, how things work' },
  { value: 'practical', label: 'Practical', desc: 'Coding, debugging, implementation' },
  { value: 'both', label: 'Both', desc: 'Mix of theory and hands-on' }
]

const stackCategories = {
  'Frontend': [
    'React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'Svelte',
    'TypeScript', 'JavaScript ES6+', 'Redux', 'Zustand',
    'HTML5', 'Responsive Design', 'Web Performance', 'Webpack/Vite',
    'Testing (Jest/Vitest)', 'GraphQL Client', 'REST APIs'
  ],
  'Backend': [
    'Node.js', 'Express.js', 'NestJS', 'Python', 'Django', 'Flask', 'FastAPI',
    'Java', 'Spring Boot', 'Go', 'Rust',
    'REST API Design', 'GraphQL', 'Microservices',
    'PostgreSQL', 'MongoDB', 'Redis', 'Prisma/ORMs',
    'Authentication/JWT', 'WebSockets', 'Message Queues'
  ],
  'DevOps': [
    'Linux', 'Networking', 'Docker', 'Kubernetes',
    'AWS', 'Azure', 'GCP', 'Cloud Basics',
    'CI/CD', 'GitHub Actions', 'Jenkins',
    'Terraform', 'Ansible', 'Nginx',
    'Load Balancing', 'Monitoring', 'Security Basics',
    'DNS/CDN', 'Serverless'
  ],
  'UI/UX': [
    'CSS3', 'Tailwind CSS', 'Sass/SCSS',
    'Shadcn UI', 'Material UI', 'Bootstrap',
    'Figma', 'Design Systems', 'Accessibility (a11y)',
    'Animation (Framer Motion/GSAP)', 'Color Theory',
    'Typography', 'UX Principles', 'Wireframing'
  ]
}

const hasStacks = computed(() => selectedStacks.value.length > 0)

function toggleStack(stack) {
  const idx = selectedStacks.value.indexOf(stack)
  if (idx === -1) {
    selectedStacks.value.push(stack)
  } else {
    selectedStacks.value.splice(idx, 1)
  }
}

function selectAllInCategory(category) {
  const stacks = stackCategories[category]
  const allSelected = stacks.every(s => selectedStacks.value.includes(s))
  if (allSelected) {
    selectedStacks.value = selectedStacks.value.filter(s => !stacks.includes(s))
  } else {
    for (const s of stacks) {
      if (!selectedStacks.value.includes(s)) {
        selectedStacks.value.push(s)
      }
    }
  }
}

function isCategoryAllSelected(category) {
  return stackCategories[category].every(s => selectedStacks.value.includes(s))
}

function isCategoryPartial(category) {
  const stacks = stackCategories[category]
  const count = stacks.filter(s => selectedStacks.value.includes(s)).length
  return count > 0 && count < stacks.length
}

async function startInterview() {
  if (!hasStacks.value) {
    toast.error('Select at least one technology/topic')
    return
  }
  if (form.value.question_count < 1 || form.value.question_count > 50) {
    toast.error('Question count must be between 1 and 50')
    return
  }
  loading.value = true
  try {
    const { data } = await api.post('/api/interview/start', {
      ...form.value,
      selected_stacks: selectedStacks.value
    })
    toast.success('Interview started!')
    router.push(`/interview/room/${data.interview.id}`)
  } catch (err) {
    toast.error(err.response?.data?.error || 'Failed to start')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-8">Setup Your Interview</h1>
    <div class="space-y-6">

      <!-- Job Role -->
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <label class="block text-sm font-medium text-gray-300 mb-3">Job Role</label>
        <div class="flex flex-wrap gap-2">
          <button v-for="r in roles" :key="r" @click="form.job_role = r"
            :class="form.job_role === r ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-800 border-gray-700 hover:border-gray-600 text-gray-300'"
            class="border rounded-lg px-4 py-2 text-sm transition">{{ r }}</button>
        </div>
      </div>

      <!-- Difficulty + Interview Type -->
      <div class="grid sm:grid-cols-2 gap-4">
        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <label class="block text-sm font-medium text-gray-300 mb-3">Difficulty</label>
          <div class="flex gap-2">
            <button v-for="d in difficulties" :key="d" @click="form.difficulty = d"
              :class="form.difficulty === d ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-800 border-gray-700 hover:border-gray-600 text-gray-300'"
              class="border rounded-lg px-4 py-2 text-sm transition flex-1">{{ d }}</button>
          </div>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <label class="block text-sm font-medium text-gray-300 mb-3">Interview Type</label>
          <div class="flex gap-2">
            <button v-for="t in types" :key="t" @click="form.interview_type = t"
              :class="form.interview_type === t ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-800 border-gray-700 hover:border-gray-600 text-gray-300'"
              class="border rounded-lg px-4 py-2 text-sm transition flex-1">{{ t }}</button>
          </div>
        </div>
      </div>

      <!-- Question Type -->
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <label class="block text-sm font-medium text-gray-300 mb-3">Question Style</label>
        <div class="grid sm:grid-cols-3 gap-3">
          <button v-for="qt in questionTypes" :key="qt.value" @click="form.question_type = qt.value"
            :class="form.question_type === qt.value ? 'bg-indigo-600 border-indigo-500' : 'bg-gray-800 border-gray-700 hover:border-gray-600'"
            class="border rounded-xl px-4 py-3 text-left transition">
            <p class="font-medium text-sm" :class="form.question_type === qt.value ? 'text-white' : 'text-gray-200'">{{ qt.label }}</p>
            <p class="text-xs mt-0.5" :class="form.question_type === qt.value ? 'text-indigo-200' : 'text-gray-500'">{{ qt.desc }}</p>
          </button>
        </div>
      </div>

      <!-- Tech Stacks -->
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div class="flex items-center justify-between mb-4">
          <label class="text-sm font-medium text-gray-300">Select Technologies / Topics</label>
          <span class="text-xs text-gray-500">{{ selectedStacks.length }} selected</span>
        </div>

        <div class="space-y-5">
          <div v-for="(stacks, category) in stackCategories" :key="category">
            <div class="flex items-center gap-2 mb-2">
              <button @click="selectAllInCategory(category)"
                class="flex items-center gap-2 text-sm font-semibold transition"
                :class="isCategoryAllSelected(category) ? 'text-indigo-400' : 'text-gray-300 hover:text-white'">
                <span class="w-4 h-4 rounded border flex items-center justify-center text-xs"
                  :class="isCategoryAllSelected(category) ? 'bg-indigo-600 border-indigo-500' : isCategoryPartial(category) ? 'bg-indigo-600/40 border-indigo-500/60' : 'border-gray-600'">
                  <span v-if="isCategoryAllSelected(category) || isCategoryPartial(category)">&#10003;</span>
                </span>
                {{ category }}
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              <button v-for="stack in stacks" :key="stack" @click="toggleStack(stack)"
                :class="selectedStacks.includes(stack)
                  ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-300'
                  : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300'"
                class="border rounded-lg px-3 py-1.5 text-xs transition">{{ stack }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Question Count + Start -->
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-300 mb-2">Number of Questions</label>
            <input v-model.number="form.question_count" type="number" min="1" max="50"
              class="w-full sm:w-40 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            <p class="text-xs text-gray-500 mt-1">1 - 50 questions</p>
          </div>
          <button @click="startInterview" :disabled="loading || !hasStacks"
            class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white font-medium py-3 px-8 rounded-lg transition disabled:opacity-50 text-lg whitespace-nowrap">
            {{ loading ? 'Starting...' : 'Start Interview' }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
