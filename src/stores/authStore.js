import { defineStore } from 'pinia'
import { useUserSessionStore } from './userSessionStore'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    loading: false,
    error: null,
  }),

  actions: {
    async register(userData) {
      this.loading = true
      this.error = null
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Get existing users from sessionStorage or create empty array
        const users = JSON.parse(sessionStorage.getItem('users') || '[]')

        // Check if username already exists
        if (users.some((user) => user.username === userData.username)) {
          throw new Error('ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว')
        }

        // Create new user object
        const newUser = {
          id: Date.now(),
          username: userData.username,
          password: userData.password, // ในระบบจริงควรเข้ารหัสก่อนเก็บ
          name: userData.name,
          email: userData.email,
          createdAt: new Date().toISOString(),
        }

        // Add new user to array and save back to sessionStorage
        users.push(newUser)
        sessionStorage.setItem('users', JSON.stringify(users))

        return { success: true }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Get users from sessionStorage
        const users = JSON.parse(sessionStorage.getItem('users') || '[]')
        const user = users.find(
          (u) => u.username === credentials.username && u.password === credentials.password,
        )

        if (!user) {
          throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
        }

        // Create session data (exclude sensitive info)
        const sessionData = {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
        }

        // Update user session store
        const userSessionStore = useUserSessionStore()
        userSessionStore.setUser(sessionData)

        return { success: true, user: sessionData }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true
      this.error = null
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Clear user session store
        const userSessionStore = useUserSessionStore()
        userSessionStore.clearUser()

        return { success: true }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
