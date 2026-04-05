<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)

async function submit() {
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    toast.success('Welcome back!')
    router.push('/dashboard')
  } catch (err) {
    toast.error(err.response?.data?.error || 'Login failed')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-indigo-400">InterviewAI</h1>
        <p class="text-gray-400 mt-2">Sign in to your account</p>
      </div>
      <form @submit.prevent="submit" class="bg-gray-900 rounded-2xl p-8 border border-gray-800 space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input v-model="email" type="email" required class="input-field" placeholder="you@example.com" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Password</label>
          <input v-model="password" type="password" required class="input-field" placeholder="••••••••" />
        </div>
        <button type="submit" :disabled="loading" class="btn-primary w-full">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
        <p class="text-center text-sm text-gray-400">
          Don't have an account? <router-link to="/register" class="text-indigo-400 hover:underline">Register</router-link>
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
