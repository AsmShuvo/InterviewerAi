<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

const auth = useAuthStore()
const router = useRouter()
const form = ref({ name: '', email: '', password: '', target_role: '', experience_level: '' })
const loading = ref(false)

async function submit() {
  loading.value = true
  try {
    await auth.register(form.value)
    toast.success('Account created!')
    router.push('/dashboard')
  } catch (err) {
    toast.error(err.response?.data?.error || 'Registration failed')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-indigo-400">InterviewAI</h1>
        <p class="text-gray-400 mt-2">Create your account</p>
      </div>
      <form @submit.prevent="submit" class="bg-gray-900 rounded-2xl p-8 border border-gray-800 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
          <input v-model="form.name" type="text" required class="input-field" placeholder="John Doe" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input v-model="form.email" type="email" required class="input-field" placeholder="you@example.com" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Password</label>
          <input v-model="form.password" type="password" required minlength="6" class="input-field" placeholder="••••••••" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Target Role</label>
          <select v-model="form.target_role" class="input-field">
            <option value="">Select role</option>
            <option>Frontend Developer</option>
            <option>Backend Developer</option>
            <option>Full Stack Developer</option>
            <option>DevOps Engineer</option>
            <option>UI/UX Designer</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Experience Level</label>
          <select v-model="form.experience_level" class="input-field">
            <option value="">Select level</option>
            <option>Junior</option>
            <option>Mid</option>
            <option>Senior</option>
          </select>
        </div>
        <button type="submit" :disabled="loading" class="btn-primary w-full">
          {{ loading ? 'Creating...' : 'Create Account' }}
        </button>
        <p class="text-center text-sm text-gray-400">
          Already have an account? <router-link to="/login" class="text-indigo-400 hover:underline">Sign in</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
.input-field {
  @apply w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent;
}
.btn-primary {
  @apply bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
