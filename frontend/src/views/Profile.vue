<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import { toast } from 'vue3-toastify'

const auth = useAuthStore()
const form = ref({ name: '', target_role: '', experience_level: '' })
const passwords = ref({ current_password: '', new_password: '' })
const loadingProfile = ref(false)
const loadingPassword = ref(false)

onMounted(() => {
  if (auth.user) {
    form.value.name = auth.user.name || ''
    form.value.target_role = auth.user.target_role || ''
    form.value.experience_level = auth.user.experience_level || ''
  }
})

async function updateProfile() {
  loadingProfile.value = true
  try {
    const { data } = await axios.put('/api/profile/update', form.value)
    auth.user = data.user
    toast.success('Profile updated')
  } catch (err) {
    toast.error(err.response?.data?.error || 'Failed to update')
  } finally {
    loadingProfile.value = false
  }
}

async function changePassword() {
  loadingPassword.value = true
  try {
    await axios.put('/api/profile/password', passwords.value)
    passwords.value = { current_password: '', new_password: '' }
    toast.success('Password changed')
  } catch (err) {
    toast.error(err.response?.data?.error || 'Failed to change password')
  } finally {
    loadingPassword.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-8 space-y-8">
    <h1 class="text-2xl font-bold">Profile</h1>

    <!-- Profile Info -->
    <form @submit.prevent="updateProfile" class="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-4">
      <h2 class="text-lg font-semibold">Personal Info</h2>
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1">Name</label>
        <input v-model="form.name" type="text" class="input-field" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
        <input :value="auth.user?.email" type="email" disabled class="input-field opacity-50 cursor-not-allowed" />
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
      <button type="submit" :disabled="loadingProfile" class="btn-primary">
        {{ loadingProfile ? 'Saving...' : 'Save Changes' }}
      </button>
    </form>

    <!-- Change Password -->
    <form @submit.prevent="changePassword" class="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-4">
      <h2 class="text-lg font-semibold">Change Password</h2>
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
        <input v-model="passwords.current_password" type="password" required class="input-field" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1">New Password</label>
        <input v-model="passwords.new_password" type="password" required minlength="6" class="input-field" />
      </div>
      <button type="submit" :disabled="loadingPassword" class="btn-primary">
        {{ loadingPassword ? 'Changing...' : 'Change Password' }}
      </button>
    </form>
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
