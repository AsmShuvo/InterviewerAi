import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    checked: false
  }),
  actions: {
    async fetchUser() {
      try {
        const { data } = await axios.get('/api/auth/me')
        this.user = data.user
      } catch {
        this.user = null
      } finally {
        this.checked = true
      }
    },
    async login(email, password) {
      const { data } = await axios.post('/api/auth/login', { email, password })
      this.user = data.user
    },
    async register(payload) {
      const { data } = await axios.post('/api/auth/register', payload)
      this.user = data.user
    },
    async logout() {
      await axios.post('/api/auth/logout')
      this.user = null
    }
  }
})
